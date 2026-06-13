import { Button } from "@/components/ui/button";
import { useBuilderStore } from "@/store/builderStore";
import type { GeometryHint, ItemTransform, Product, SceneObject, SceneObjectKind } from "@/types";
import { OrbitControls, Text, TransformControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
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

type TransformMode = "translate" | "rotate";

type SelectedInstance = {
  id: string;
  kind: SceneObjectKind;
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
  transformMode: TransformMode;
  onSelect: () => void;
  onTransformChange: (t: Partial<ItemTransform>) => void;
  onDelete: () => void;
}

function ItemInstance({
  obj,
  selected,
  transformMode,
  onSelect,
  onTransformChange,
  onDelete,
}: ItemInstanceProps) {
  const groupRef = useRef<THREE.Group>(null);
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

  const persistCurrentTransform = useCallback(() => {
    if (obj.locked) return;
    const group = groupRef.current;
    if (!group) return;

    onTransformChange({
      posX: group.position.x,
      posY: group.position.y,
      posZ: group.position.z,
      rotX: group.rotation.x,
      rotY: group.rotation.y,
      rotZ: group.rotation.z,
    });
  }, [obj.kind, obj.locked, onTransformChange]);

  const selectObject = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onSelect();
    },
    [onSelect],
  );

  useEffect(() => {
    if (!selected || obj.locked) return;

    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.tagName === "SELECT") {
        return;
      }

      const handledKeys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "r", "R", "Delete", "Backspace"];
      if (!handledKeys.includes(e.key)) return;

      e.preventDefault();
      e.stopPropagation();

      if (e.key === "ArrowLeft") onTransformChange({ posX: transform.posX - 0.2 });
      if (e.key === "ArrowRight") onTransformChange({ posX: transform.posX + 0.2 });
      if (e.key === "ArrowUp") onTransformChange({ posZ: transform.posZ - 0.2 });
      if (e.key === "ArrowDown") onTransformChange({ posZ: transform.posZ + 0.2 });
      if (e.key === "r" || e.key === "R") onTransformChange({ rotY: (transform.rotY + Math.PI / 8) % (Math.PI * 2) });
      if (e.key === "Delete" || e.key === "Backspace") onDelete();
    };

    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [obj.locked, onDelete, onTransformChange, selected, transform]);

  const group = (
    <group
      ref={groupRef}
      position={[transform.posX, transform.posY, transform.posZ]}
      rotation={[transform.rotX, transform.rotY, transform.rotZ]}
      onPointerDown={selectObject}
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
        {obj.product.name} #{obj.instanceIndex + 1}
      </Text>
    </group>
  );

  if (selected && !obj.locked) {
    return (
      <TransformControls
        mode={transformMode}
        size={0.85}
        showX
        showY
        showZ
        onMouseUp={persistCurrentTransform}
      >
        {group}
      </TransformControls>
    );
  }

  return group;
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
  transformMode,
}: {
  selectedId: string | null;
  setSelected: (selected: SelectedInstance) => void;
  transformMode: TransformMode;
}) {
  const environment = useBuilderStore((s) => s.environment);
  const selectedBase = useBuilderStore((s) => s.selectedBase);
  const selectedWall = useBuilderStore((s) => s.selectedWall);
  const baseQuantity = useBuilderStore((s) => s.baseQuantity);
  const wallQuantity = useBuilderStore((s) => s.wallQuantity);
  const baseTransforms = useBuilderStore((s) => s.baseTransforms);
  const wallTransforms = useBuilderStore((s) => s.wallTransforms);
  const accessories = useBuilderStore((s) => s.accessories);
  const getSceneObjects = useBuilderStore((s) => s.getSceneObjects);
  const updateSceneObjectTransform = useBuilderStore((s) => s.updateSceneObjectTransform);
  const removeSceneObjectInstance = useBuilderStore((s) => s.removeSceneObjectInstance);

  const sceneObjects = useMemo(
    () => getSceneObjects(),
    [
      getSceneObjects,
      selectedBase,
      selectedWall,
      baseQuantity,
      wallQuantity,
      baseTransforms,
      wallTransforms,
      accessories,
    ],
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
          transformMode={transformMode}
          onSelect={() =>
            setSelected({
              id: obj.id,
              kind: obj.kind,
              productId: obj.productId,
              instanceIndex: obj.instanceIndex,
              productName: obj.product.name,
              locked: obj.locked,
            })
          }
          onTransformChange={(t) => {
            if (!obj.locked) updateSceneObjectTransform(obj.kind, obj.productId, obj.instanceIndex, t);
          }}
          onDelete={() => {
            if (!obj.locked) {
              removeSceneObjectInstance(obj.kind, obj.productId, obj.instanceIndex);
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
  const [transformMode, setTransformMode] = useState<TransformMode>("translate");
  const updateSceneObjectTransform = useBuilderStore((s) => s.updateSceneObjectTransform);
  const removeSceneObjectInstance = useBuilderStore((s) => s.removeSceneObjectInstance);
  const selectedBase = useBuilderStore((s) => s.selectedBase);
  const selectedWall = useBuilderStore((s) => s.selectedWall);
  const baseQuantity = useBuilderStore((s) => s.baseQuantity);
  const wallQuantity = useBuilderStore((s) => s.wallQuantity);
  const baseTransforms = useBuilderStore((s) => s.baseTransforms);
  const wallTransforms = useBuilderStore((s) => s.wallTransforms);
  const accessories = useBuilderStore((s) => s.accessories);
  const getSceneObjects = useBuilderStore((s) => s.getSceneObjects);

  const selectedTransform = useMemo(() => {
    if (!selected || selected.locked) return null;
    return getSceneObjects().find((obj) => obj.id === selected.id)?.transform ?? null;
  }, [
    getSceneObjects,
    selected,
    selectedBase,
    selectedWall,
    baseQuantity,
    wallQuantity,
    baseTransforms,
    wallTransforms,
    accessories,
  ]);

  const rotateSelected = (direction: 1 | -1) => {
    if (!selected || selected.locked || !selectedTransform) return;
    updateSceneObjectTransform(selected.kind, selected.productId, selected.instanceIndex, {
      rotY: (selectedTransform.rotY + direction * Math.PI / 8) % (Math.PI * 2),
    });
  };

  const deleteSelected = () => {
    if (!selected || selected.locked) return;
    removeSceneObjectInstance(selected.kind, selected.productId, selected.instanceIndex);
    setSelected(null);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#080b12]" data-ocid="builder.three_canvas">
      <Canvas shadows camera={{ position: [6, 5, 8], fov: 45 }} gl={{ antialias: true, alpha: false }} style={{ background: "#080b12" }}>
        <SceneContent selectedId={selected?.id ?? null} setSelected={setSelected} transformMode={transformMode} />
      </Canvas>

      <div className="absolute left-3 bottom-3 pointer-events-none">
        <p className="text-xs text-muted-foreground/70 bg-card/80 backdrop-blur-sm px-2 py-1 rounded border border-border/50">
          Orbit/Pan/Zoom view · Click an object · Use Move/Rotate gizmo · Arrow keys still work as backup
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
            <p className="text-xs text-muted-foreground mt-2">This module is locked.</p>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border/70 bg-background/40 p-1">
                <Button
                  type="button"
                  variant={transformMode === "translate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTransformMode("translate")}
                  data-ocid="builder.gizmo_move"
                >
                  Move Gizmo
                </Button>
                <Button
                  type="button"
                  variant={transformMode === "rotate" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTransformMode("rotate")}
                  data-ocid="builder.gizmo_rotate"
                >
                  Rotate Gizmo
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-2">
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

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Drag the colored gizmo handles for X/Y/Z placement or rotation. Keyboard arrows are only a backup now.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

