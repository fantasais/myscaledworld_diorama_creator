import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/builderStore";
import type { GeometryHint, ItemTransform, Product, SceneObject } from "@/types";
import { OrbitControls, Text } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const CATEGORY_COLOR: Record<string, string> = {
  base: "#4a6fa5",
  wall: "#5a7a6b",
  structure: "#5a7a6b",
  accessory: "#c07d3a",
  decal: "#a88f4a",
  kit: "#8c6fc0",
};

type SelectedInstance = {
  id: string;
  productId: string;
  instanceIndex: number;
  productName: string;
  locked?: boolean;
} | null;

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

  return (
    <mesh castShadow>
      <boxGeometry args={boxArgs} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
    </mesh>
  );
}

function StlMesh({ url, color }: { url: string; color: string }) {
  const geometry = useLoader(STLLoader, url);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current && geometry) {
      geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (!box) return;
      const center = new THREE.Vector3();
      box.getCenter(center);
      geometry.translate(-center.x, -center.y, -center.z);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) meshRef.current.scale.setScalar(1 / maxDim);
    }
  }, [geometry]);

  return (
    <mesh ref={meshRef} castShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial color={color} roughness={0.4} metalness={0.25} />
    </mesh>
  );
}

interface ItemInstanceProps {
  obj: SceneObject;
  selected: boolean;
  onSelect: () => void;
  onTransformChange: (t: Partial<ItemTransform>) => void;
  onDelete: () => void;
}

function ItemInstance({
  obj,
  selected,
  onSelect,
  onTransformChange,
  onDelete,
}: ItemInstanceProps) {
  const { gl } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef(new THREE.Vector3());
  const color = CATEGORY_COLOR[obj.product.category] ?? "#888";
  const transform: ItemTransform = {
    rotX: 0,
    rotY: 0,
    rotZ: 0,
    posX: 0,
    posY: 0,
    posZ: 0,
    ...obj.transform,
  };

  const onPointerDown = useCallback(
    (e: { stopPropagation: () => void; point: THREE.Vector3 }) => {
      e.stopPropagation();
      onSelect();
      if (obj.locked) return;
      isDragging.current = true;
      if (groupRef.current) {
        const pos = groupRef.current.position;
        dragOffset.current.set(pos.x - e.point.x, 0, pos.z - e.point.z);
      }
      gl.domElement.style.cursor = "grabbing";
    },
    [gl, obj.locked, onSelect],
  );

  const onPointerMove = useCallback(
    (e: { point: THREE.Vector3; stopPropagation: () => void }) => {
      if (!isDragging.current || obj.locked) return;
      e.stopPropagation();
      onTransformChange({
        posX: e.point.x + dragOffset.current.x,
        posZ: e.point.z + dragOffset.current.z,
      });
    },
    [obj.locked, onTransformChange],
  );

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
    gl.domElement.style.cursor = "auto";
  }, [gl]);

  useEffect(() => {
    if (!selected || obj.locked) return;

    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") {
        return;
      }

      if (e.key === "ArrowLeft") onTransformChange({ posX: transform.posX - 0.2 });
      if (e.key === "ArrowRight") onTransformChange({ posX: transform.posX + 0.2 });
      if (e.key === "ArrowUp") onTransformChange({ posZ: transform.posZ - 0.2 });
      if (e.key === "ArrowDown") onTransformChange({ posZ: transform.posZ + 0.2 });
      if (e.key === "r" || e.key === "R") onTransformChange({ rotY: (transform.rotY + Math.PI / 8) % (Math.PI * 2) });
      if (e.key === "Delete" || e.key === "Backspace") onDelete();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [obj.locked, onDelete, onTransformChange, selected, transform]);

  return (
    <group
      ref={groupRef}
      position={[transform.posX, transform.posY, transform.posZ]}
      rotation={[transform.rotX, transform.rotY, transform.rotZ]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]}>
          <ringGeometry args={[0.55, 0.65, 32]} />
          <meshBasicMaterial color={obj.locked ? "#6aa5ff" : "#e8a040"} transparent opacity={0.8} />
        </mesh>
      )}

      {obj.product.stlUrl ? (
        <Suspense fallback={<PlaceholderMesh hint={obj.product.geometryHint ?? "box"} color={color} product={obj.product} />}>
          <StlMesh url={obj.product.stlUrl} color={color} />
        </Suspense>
      ) : (
        <PlaceholderMesh hint={obj.product.geometryHint ?? "box"} color={color} product={obj.product} />
      )}

      <Text
        position={[0, 0.8, 0]}
        fontSize={0.18}
        color={selected ? "#e8a040" : "#cccccc"}
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {obj.product.name}{obj.kind === "accessory" ? ` #${obj.instanceIndex + 1}` : ""}
      </Text>
    </group>
  );
}

function FloorGrid() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.3, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#080b12" roughness={0.9} metalness={0.1} />
      </mesh>
      <gridHelper args={[20, 20, "#2a2a4a", "#16162a"]} position={[0, -0.29, 0]} />
    </>
  );
}

function SceneContent({
  selectedId,
  setSelected,
}: {
  selectedId: string | null;
  setSelected: (selected: SelectedInstance) => void;
}) {
  const environment = useBuilderStore((s) => s.environment);
  const selectedBase = useBuilderStore((s) => s.selectedBase);
  const selectedWall = useBuilderStore((s) => s.selectedWall);
  const accessories = useBuilderStore((s) => s.accessories);
  const getSceneObjects = useBuilderStore((s) => s.getSceneObjects);
  const updateTransform = useBuilderStore((s) => s.updateTransform);
  const removeAccessoryInstance = useBuilderStore((s) => s.removeAccessoryInstance);

  const sceneObjects = useMemo(
    () => getSceneObjects(),
    [getSceneObjects, selectedBase, selectedWall, accessories],
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[-4, 4, -4]} intensity={0.4} color="#8090ff" />
      <FloorGrid />

      {!environment && (
        <Text position={[0, 0.5, 0]} fontSize={0.35} color="#666688" anchorX="center">
          Select environment to begin
        </Text>
      )}

      {sceneObjects.map((obj) => (
        <ItemInstance
          key={obj.id}
          obj={obj}
          selected={selectedId === obj.id}
          onSelect={() =>
            setSelected({
              id: obj.id,
              productId: obj.productId,
              instanceIndex: obj.instanceIndex,
              productName: obj.product.name,
              locked: obj.locked,
            })
          }
          onTransformChange={(t) => {
            if (!obj.locked && obj.kind === "accessory") updateTransform(obj.productId, obj.instanceIndex, t);
          }}
          onDelete={() => {
            if (!obj.locked && obj.kind === "accessory") {
              removeAccessoryInstance(obj.productId, obj.instanceIndex);
              setSelected(null);
            }
          }}
        />
      ))}

      <OrbitControls makeDefault enableDamping dampingFactor={0.08} enablePan enableZoom enableRotate />
    </>
  );
}

export function ThreeScene() {
  const [selected, setSelected] = useState<SelectedInstance>(null);
  const updateTransform = useBuilderStore((s) => s.updateTransform);
  const removeAccessoryInstance = useBuilderStore((s) => s.removeAccessoryInstance);
  const accessories = useBuilderStore((s) => s.accessories);

  const selectedTransform = useMemo(() => {
    if (!selected || selected.locked) return null;
    return accessories[selected.productId]?.transforms[`${selected.productId}:${selected.instanceIndex}`] ?? null;
  }, [accessories, selected]);

  const rotateSelected = (direction: 1 | -1) => {
    if (!selected || selected.locked || !selectedTransform) return;
    updateTransform(selected.productId, selected.instanceIndex, {
      rotY: (selectedTransform.rotY + direction * Math.PI / 8) % (Math.PI * 2),
    });
  };

  const deleteSelected = () => {
    if (!selected || selected.locked) return;
    removeAccessoryInstance(selected.productId, selected.instanceIndex);
    setSelected(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#080b12]" data-ocid="builder.three_canvas">
      <Canvas shadows camera={{ position: [6, 5, 8], fov: 45 }} gl={{ antialias: true, alpha: false }} style={{ background: "#080b12" }}>
        <SceneContent selectedId={selected?.id ?? null} setSelected={setSelected} />
      </Canvas>

      <div className="absolute left-3 bottom-3 pointer-events-none">
        <p className="text-xs text-muted-foreground/70 bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
          Orbit/Pan/Zoom view · Click an object · Drag to move · R to rotate · Delete to remove
        </p>
      </div>

      {selected && (
        <div className="absolute right-3 top-3 w-72 rounded-xl border border-border bg-card/90 backdrop-blur-md p-3 shadow-xl" data-ocid="builder.selected_object_panel">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Selected Object</p>
              <h3 className="text-sm font-semibold text-foreground truncate">{selected.productName} #{selected.instanceIndex + 1}</h3>
            </div>
            {selected.locked && <span className="text-[10px] font-mono uppercase text-muted-foreground border border-border px-1.5 py-0.5 rounded">Locked</span>}
          </div>

          {selected.locked ? (
            <p className="text-xs text-muted-foreground mt-2">Base and wall modules are locked for now. Accessories can be moved, rotated and removed.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 mt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => rotateSelected(-1)} className="gap-1" data-ocid="builder.rotate_ccw">
                <RotateCcw className="w-3.5 h-3.5" /> Left
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => rotateSelected(1)} className="gap-1" data-ocid="builder.rotate_cw">
                <RotateCw className="w-3.5 h-3.5" /> Right
              </Button>
              <Button type="button" variant="destructive" size="sm" onClick={deleteSelected} className="gap-1" data-ocid="builder.delete_instance">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

