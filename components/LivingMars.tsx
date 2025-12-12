
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { MarketStats } from '../types';
import { useTheme } from '../store/ThemeContext';

// Fix for missing JSX type definitions for React Three Fiber elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: any;
      mesh: any;
      sphereGeometry: any;
      meshStandardMaterial: any;
      meshPhongMaterial: any;
      cylinderGeometry: any;
      meshBasicMaterial: any;
      ambientLight: any;
      pointLight: any;
      color: any; // Added for background color attachment
    }
  }
}

interface LivingMarsProps {
  stats: MarketStats;
}

const MarsMesh: React.FC<{ stats: MarketStats }> = ({ stats }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  
  // Dynamic material properties based on stats
  const emissiveColor = useMemo(() => {
     return stats.lastCrash ? new THREE.Color('#550000') : new THREE.Color('#ff3300');
  }, [stats.lastCrash]);

  const atmosphereColor = useMemo(() => {
     return stats.lastCrash ? '#8B4513' : '#4169E1'; // Dusty brown if crash, Blue hue if healthy
  }, [stats.lastCrash]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    // Pulse the atmosphere based on volume
    if (atmosphereRef.current) {
        const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05;
        const baseScale = 1.2 + (stats.globalVolume / 200); // Higher volume = larger atmosphere
        const scale = baseScale + pulse;
        atmosphereRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group>
      {/* Main Planet */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshStandardMaterial 
            color={stats.lastCrash ? "#8B4513" : "#C1440E"} 
            roughness={0.7} 
            metalness={0.2}
            emissive={emissiveColor}
            emissiveIntensity={stats.globalVolume / 200} // Glows brighter with volume
        />
      </mesh>

      {/* Atmosphere Glow */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.2, 64, 64]} />
        <meshPhongMaterial
          color={atmosphereColor}
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* IPO Beam - Only renders if there is an active IPO */}
      {stats.activeIpo && (
         <mesh position={[stats.activeIpo.x, stats.activeIpo.y, stats.activeIpo.z]} rotation={[0,0,Math.PI/4]}>
            <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
            <meshBasicMaterial color="#14F195" transparent opacity={0.8} />
         </mesh>
      )}
    </group>
  );
};

const LivingMars: React.FC<LivingMarsProps> = ({ stats }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="w-full h-full min-h-[300px] relative rounded-3xl overflow-hidden shadow-lg border border-border">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-white/60 text-xs font-mono uppercase tracking-widest bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Live Orbital View</h3>
        <div className="flex items-center gap-2 mt-1">
            <div className={`w-2 h-2 rounded-full ${stats.lastCrash ? 'bg-red-500' : 'bg-green-500'} animate-pulse`} />
            <span className="text-sm font-bold text-white drop-shadow-md">{stats.lastCrash ? 'ATMOSPHERE WARNING' : 'SYSTEM OPTIMAL'}</span>
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
        {/* Dynamic Background Color based on Theme */}
        <color attach="background" args={[isDark ? '#050505' : '#E2E8F0']} />

        <ambientLight intensity={isDark ? 0.2 : 0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        
        {/* Render Stars only in Dark Mode */}
        {isDark && <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />}
        
        <Sparkles count={50} scale={10} size={2} speed={0.4} opacity={0.5} color="#14F195" />
        <MarsMesh stats={stats} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};

export default LivingMars;
