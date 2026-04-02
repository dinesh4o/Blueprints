import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer, Html } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import * as THREE from 'three';
import { Camera } from 'lucide-react';

extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardCardProps {
  avatarPreview: string | null;
  cardName: string;
  cardEmail: string;
  badgeId: string;
  qrPattern: boolean[];
  onAvatarClick: () => void;
  issuedDate: string;
  planLabel?: string;
  analysisRuns?: number;
  reportsGenerated?: number;
}

export function LanyardCard(props: LanyardCardProps) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative z-0 w-full h-[650px] flex justify-center items-center cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 0, 11], fov: 25 }}
        dpr={[1, isMobile ? 1.5 : 2]}
        gl={{ alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), 0)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={[0, -40, 0]} timeStep={isMobile ? 1 / 30 : 1 / 60}>
          <Band isMobile={isMobile} domProps={props} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
          <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, isMobile = false, domProps }: any) {
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: any = { type: 'dynamic', canSleep: true, colliders: false, angularDamping: 4, linearDamping: 4 };

  const { nodes, materials } = useGLTF('/card.glb') as any;
  const texture = useTexture('/lanyard.png');
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [[0, 0, 0], [0, 1.45, 0]]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => { document.body.style.cursor = 'auto'; };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(ref.current.translation(), delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed)));
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      if (band.current && band.current.geometry) band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type="dynamic">
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e) => { e.target.releasePointerCapture(e.pointerId); drag(false); }}
            onPointerDown={(e) => {
              e.target.setPointerCapture(e.pointerId);
              drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
            }}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={materials.base.map} map-anisotropy={16} clearcoat={isMobile ? 0 : 1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
              
              <Html transform occlude distanceFactor={1.12} position={[0, 0, 0.015]} style={{ width: '290px', height: '410px', pointerEvents: 'none' }}>
                  <CardDomOverlay {...domProps} />
              </Html>

            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial color="white" depthTest={false} resolution={isMobile ? [1000, 2000] : [1000, 1000]} useMap map={texture} repeat={[-4, 1]} lineWidth={1} />
      </mesh>
    </>
  );
}

function CardDomOverlay({ avatarPreview, cardName, cardEmail, badgeId, qrPattern, issuedDate, onAvatarClick, planLabel, analysisRuns, reportsGenerated }: any) {
  return (
    <div className="relative h-[410px] w-[290px] overflow-hidden rounded-[24px] border border-zinc-700/80 bg-zinc-950 p-[24px] text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 opacity-90" />
      <div className="pointer-events-none absolute inset-x-0 top-[112px] h-[130px] opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(82,82,91,0.2) 0 2px, transparent 2px 14px), repeating-linear-gradient(45deg, rgba(82,82,91,0.2) 0 2px, transparent 2px 14px)' }} />
      <div className="pointer-events-none absolute -right-[40px] top-0 h-full w-[80px] rotate-[15deg] bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-30 blur-md" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <p className="text-[52px] leading-[0.8] font-black tracking-[-0.09em] pb-1 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">AI</p>
          <div className="text-right leading-[1.2] mt-1">
            <p className="text-[13px] font-bold tracking-[0.2em] text-indigo-400">RESEARCH</p>
            <p className="mt-1 text-[13px] font-bold text-zinc-500">{issuedDate}</p>
          </div>
        </div>

        <div>
          <p className="text-[34px] leading-[0.95] font-bold text-zinc-100 tracking-[-0.03em] drop-shadow-sm max-w-[210px] pb-3">AI Synthesizer</p>
          <div className="flex gap-6 mt-2 ml-1">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500/80 mb-0.5 uppercase">RUNS</p>
              <p className="text-[18px] font-black text-zinc-200 leading-none drop-shadow-sm">{analysisRuns ?? 0}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500/80 mb-0.5 uppercase">REPORTS</p>
              <p className="text-[18px] font-black text-zinc-200 leading-none drop-shadow-sm">{reportsGenerated ?? 0}</p>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 pointer-events-auto">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.22em] text-zinc-500/80 mb-1 uppercase uppercase">{planLabel || 'RESEARCHER'}</p>
            <p className="truncate text-[28px] font-bold uppercase leading-none text-zinc-100 drop-shadow-sm">{cardName}</p>
            <p className="mt-2 truncate text-[14px] font-medium text-zinc-400">{cardEmail}</p>
            <p className="mt-1 font-mono text-[10px] text-zinc-600">ID: {badgeId}</p>
          </div>

          <button type="button" onClick={onAvatarClick} className="relative group h-[82px] w-[82px] shrink-0 overflow-hidden rounded-xl border border-zinc-700/80 bg-zinc-900 shadow-inner ring-1 ring-white/10 cursor-pointer">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Profile" className="h-full w-full object-cover pointer-events-none" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-800 text-3xl font-semibold text-zinc-400 pointer-events-none">
                {cardName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
              <Camera className="w-6 h-6 text-white/90 drop-shadow-md" /> 
            </div>
          </button>
        </div>

        <div className="pointer-events-none absolute -right-2 top-[160px] flex max-w-[34px] flex-wrap justify-end gap-[4px] opacity-40 mix-blend-overlay">
          {qrPattern.slice(0, 15).map((filled: boolean, index: number) => (
            <span key={index} className={`h-2 w-2 rounded-[1.5px] ${filled ? 'bg-zinc-200 shadow-[0_0_2px_#fff]' : 'bg-zinc-800'}`} />
          ))}
        </div>
      </div>
    </div>
  );
}