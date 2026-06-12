import { useBuilderStore } from "@/store/builderStore";
import type { GeometryHint, ItemTransform, Product } from "@/types";
import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

// ── Category colour map ───────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  base: "#4a6fa5",
  wall: "#5a7a6b",
  structure: "#5a7a6b",
  accessory: "#c07d3a",
  decal: "#a88f4a",
  kit: "#8c6fc0",
};

// ── Procedural placeholder geometry per hint ─────────────────
function PlaceholderMesh({
  hint,
  color,
  product,
}: { hint: GeometryHint; color: string; product?: Product }) {
  const box = product?.boundingBox;
  const boxArgs: [number, number, number] = box
    ? [box.width, box.height, box.depth]
    : hint === "thin_box"
      ? [1.2, 0.12, 0.8]
      : hint === "flat_plane"
        ? [4, 0.04, 4]
        : [0.7, 0.5, 0.5];
  if (hint === "cylinder") {
    return (
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
    );
  }
  if (hint === "cone") {
    return (
      <mesh castShadow>
        <coneGeometry args={[0.3, 0.9, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
    );
  }
  if (hint === "sphere") {
    return (
      <mesh castShadow>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.3} />
      </mesh>
    );
  }
  // default box
  return (
    <mesh castShadow>
      <boxGeometry args={boxArgs} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </mesh>
  );
}

// ── STL Mesh loader ───────────────────────────────────────
function StlMesh({ url, color }: { url: string; color: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current && geometry) {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox!;
      const center = new THREE.Vector3();
      box.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      // auto-scale to ~1 unit
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0 && meshRef.current) {
        meshRef.current.scale.setScalar(1 / maxDim);
      }
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} castShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.25} />
    </mesh>
  );
}

// ── Draggable item instance ──────────────────────────────
interface ItemInstanceProps {
  product: Product;
  instanceIndex: number;
  transform: ItemTransform;
  selected: boolean;
  onSelect: () => void;
  onTransformChange: (t: Partial<ItemTransform>) => void;
}

function ItemInstance({
  product,
  instanceIndex: _instanceIndex,
  transform,
  selected,
  onSelect,
  onTransformChange,
}: ItemInstanceProps) {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const _dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const isDragging = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const color = CATEGORY_COLOR[product.category] ?? "#888";

  const onPointerDown = useCallback(
    (e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
      e.stopPropagation();
      onSelect();
      isDragging.current = true;
      if (groupRef.current) {
        const pos = groupRef.current.position;
        dragOffset.current.set(pos.x - e.point.x, 0, pos.z - e.point.z);
      }
      gl.domElement.style.cursor = "grabbing";
    },
    [onSelect, gl],
  );

  const onPointerMove = useCallback(
    (e: { point: THREE.Vector3 }) => {
      if (!isDragging.current) return;
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const rect = gl.domElement.getBoundingClientRect();
      // project intersection onto floor plane
      const newX = e.point.x + dragOffset.current.x;
      const newZ = e.point.z + dragOffset.current.z;
      // suppress unused vars
      void raycaster;
      void ndc;
      void rect;
      onTransformChange({ posX: newX, posZ: newZ });
    },
    [onTransformChange, gl],
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    gl.domElement.style.cursor = "auto";
  }, [gl]);

  // Keyboard rotate/move on selected
  useEffect(() => {
    if (!selected) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        onTransformChange({ posX: transform.posX - 0.2 });
      if (e.key === "ArrowRight")
        onTransformChange({ posX: transform.posX + 0.2 });
      if (e.key === "ArrowUp")
        onTransformChange({ posZ: transform.posZ - 0.2 });
      if (e.key === "ArrowDown")
        onTransformChange({ posZ: transform.posZ + 0.2 });
      if (e.key === "r" || e.key === "R") {
        onTransformChange({
          rotY: (transform.rotY + Math.PI / 8) % (Math.PI * 2),
        });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, transform, onTransformChange]);

  return (
    <group
      ref={groupRef}
      position={[transform.posX, transform.posY, transform.posZ]}
      rotation={[0, transform.rotY, 0]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Selection glow ring */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshBasicMaterial color="#e8a040" transparent opacity={0.8} />
        </mesh>
      )}

      {product.stlUrl ? (
        <Suspense
          fallback={
            <PlaceholderMesh
              hint={product.geometryHint ?? "box"}
              color={color}
              product={product}
            />
          }
        >
          <StlMesh url={product.stlUrl} color={color} />
        </Suspense>
      ) : (
        <PlaceholderMesh
          hint={product.geometryHint ?? "box"}
          color={color}
          product={product}
        />
      )}

      {/* Label above */}
      <Text
        position={[0, 0.8, 0]}
        fontSize={0.18}
        color={selected ? "#e8a040" : "#cccccc"}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {product.name}
      </Text>
    </group>
  );
}

// ── Scene camera void (floor plane) ────────────────────────
function FloorGrid() {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.3, 0]}
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial
          color="var(--canvas-bg)"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
      <gridHelper
        args={[20, 20, "#2a2a4a", "#16162a"]}
        position={[0, -0.29, 0]}
      />
    </>
  );
}

// ── Scene content ───────────────────────────────────────
function SceneContent() {
  const environment = useBuilderStore((s) => s.environment);
  const selectedBase = useBuilderStore((s) => s.selectedBase);
  const selectedWall = useBuilderStore((s) => s.selectedWall);
  const accessories = useBuilderStore((s) => s.accessories);
  const getSceneObjects = useBuilderStore((s) => s.getSceneObjects);
  const updateTransform = useBuilderStore((s) => s.updateTransform);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Important: do not call getSceneObjects() directly inside the Zustand selector.
  // It returns a fresh array each time and can trigger React error #185 in production.
  const sceneObjects = useMemo(
    () => getSceneObjects(),
    [getSceneObjects, selectedBase, selectedWall, accessories],
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-4, 4, -4]} intensity={0.4} color="#8090ff" />
      <FloorGrid />
      {!environment && (
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.35}
          color="#666688"
          anchorX="center"
        >
          Select environment to begin
        </Text>
      )}
      {sceneObjects.map((obj) => (
        <ItemInstance
          key={obj.id}
          product={obj.product}
          instanceIndex={obj.instanceIndex}
          transform={obj.transform}
          selected={selectedKey === obj.id}
          onSelect={() => setSelectedKey(obj.id)}
          onTransformChange={(t) => {
            if (!obj.locked && obj.kind === "accessory") {
              updateTransform(obj.productId, obj.instanceIndex, t);
            }
          }}
        />
      ))}
      <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
    </>
  );
}

// ── Public component ─────────────────────────────────────
export function ThreeScene() {
  const canvasRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={canvasRef}
      className="w-full h-full rounded-xl overflow-hidden bg-[var(--canvas-bg)]"
      data-ocid="builder.three_canvas"
    >
      <Canvas
        shadows
        camera={{ position: [6, 5, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "oklch(var(--canvas-bg))" }}
      >
        <SceneContent />
      </Canvas>

      {/* Keyboard hint overlay */}
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <p className="text-xs text-muted-foreground/60 bg-card/70 backdrop-blur-sm px-2 py-1 rounded">
          Click item to select · Arrow keys to move · R to rotate
        </p>
      </div>
    </div>
  );
}

