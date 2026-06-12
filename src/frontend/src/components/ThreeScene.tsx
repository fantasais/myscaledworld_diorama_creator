import { useBuilderStore } from "@/store/builderStore";
import type { GeometryHint, ItemTransform, Product } from "@/types";
import { ContactShadows, Grid, OrbitControls, Text } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { RotateCcw } from "lucide-react";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import type React from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

// ── Orbit controls ref type extracted from the drei component ──
type OrbitControlsRef = React.ElementRef<typeof OrbitControls>;

// ── Category colour map ───────────────────────────────────
const CATEGORY_COLOR: Record<string, string> = {
  base: "#4a6fa5",
  wall: "#5a7a6b",
  structure: "#5a7a6b",
  accessory: "#c07d3a",
};

// ── Procedural placeholder geometry per hint ─────────────────
function PlaceholderMesh({
  hint,
  color,
}: { hint: GeometryHint; color: string }) {
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
      <boxGeometry args={[0.7, 0.5, 0.5]} />
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
            />
          }
        >
          <StlMesh url={product.stlUrl} color={color} />
        </Suspense>
      ) : (
        <PlaceholderMesh hint={product.geometryHint ?? "box"} color={color} />
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

// ── Scene floor, grid and shadows ──────────────────────────
function FloorGrid() {
  return (
    <>
      {/* Receiver plane for shadows */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.3, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#0d0d1a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>
      {/* Subtle grid overlay */}
      <Grid
        position={[0, -0.295, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#2a2a4a"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#3a3a5a"
        fadeDistance={18}
        fadeStrength={1.5}
        infiniteGrid={false}
        followCamera={false}
      />
      {/* Soft contact shadows beneath all objects */}
      <ContactShadows
        position={[0, -0.28, 0]}
        opacity={0.55}
        scale={20}
        blur={2.5}
        far={4}
        resolution={256}
        color="#000000"
      />
    </>
  );
}

// ── Scene content ───────────────────────────────────────
interface SceneContentProps {
  orbitRef: React.RefObject<OrbitControlsRef | null>;
}

function SceneContent({ orbitRef }: SceneContentProps) {
  const { environment, selectedBase, selectedWall, accessories } =
    useBuilderStore();
  const updateTransform = useBuilderStore((s) => s.updateTransform);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  // Flat list of all items to render
  const items: {
    product: Product;
    instanceIndex: number;
    transform: ItemTransform;
    key: string;
  }[] = [];

  if (selectedBase) {
    items.push({
      product: selectedBase,
      instanceIndex: 0,
      transform: { posX: 0, posY: -0.26, posZ: 0, rotY: 0 },
      key: `${selectedBase.id}:0`,
    });
  }
  if (selectedWall) {
    items.push({
      product: selectedWall,
      instanceIndex: 0,
      transform: { posX: 0, posY: 0.3, posZ: -2.5, rotY: 0 },
      key: `${selectedWall.id}:0`,
    });
  }
  for (const item of Object.values(accessories)) {
    for (let i = 0; i < item.quantity; i++) {
      const key = `${item.product.id}:${i}`;
      const transform = item.transforms[key] ?? {
        posX: i * 1.5 - 1.5,
        posY: 0,
        posZ: i * 0.5,
        rotY: 0,
      };
      items.push({ product: item.product, instanceIndex: i, transform, key });
    }
  }

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
      {items.map(({ product, instanceIndex, transform, key }) => (
        <ItemInstance
          key={key}
          product={product}
          instanceIndex={instanceIndex}
          transform={transform}
          selected={selectedKey === key}
          onSelect={() => setSelectedKey(key)}
          onTransformChange={(t) => {
            // base and wall have fixed transforms
            if (product.category === "accessory") {
              updateTransform(product.id, instanceIndex, t);
            }
          }}
        />
      ))}
      <OrbitControls
        ref={orbitRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
      />
    </>
  );
}

// ── Public component ─────────────────────────────────────
export function ThreeScene() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<OrbitControlsRef | null>(null);

  function handleResetCamera() {
    if (orbitRef.current) {
      orbitRef.current.reset();
    }
  }

  return (
    <div
      ref={canvasRef}
      className="w-full h-full rounded-xl overflow-hidden bg-[var(--canvas-bg)] relative"
      data-ocid="builder.three_canvas"
    >
      <Canvas
        shadows
        camera={{ position: [6, 5, 8], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: "oklch(var(--canvas-bg))" }}
      >
        <SceneContent orbitRef={orbitRef} />
      </Canvas>

      {/* Reset Camera button */}
      <button
        type="button"
        onClick={handleResetCamera}
        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-card/80 border border-border/60 backdrop-blur-sm text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors text-xs font-mono"
        data-ocid="builder.reset_camera_button"
        title="Reset camera to default view"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Reset Camera
      </button>

      {/* Keyboard hint overlay */}
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <p className="text-xs text-muted-foreground/60 bg-card/70 backdrop-blur-sm px-2 py-1 rounded">
          Click item to select · Arrow keys to move · R to rotate
        </p>
      </div>
    </div>
  );
}
