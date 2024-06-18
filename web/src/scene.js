import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Perlin } from 'three-noise';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { material1, material2, material3 } from './CustomShaderMaterial';

const noise = new Perlin();

function Camera({ position }) {
    const cameraRef = useRef();

    useEffect(() => {
        if (cameraRef.current && position) {
            cameraRef.current.position.set(...position);
        }
    }, [position]);

    return <PerspectiveCamera makeDefault ref={cameraRef} />;
}

function AnimatedSphere({ frequency = 4, scale = 0.2, size = 100, material }) {
    const meshRef = useRef();

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        const positionArray = meshRef.current.geometry.attributes.position.array;

        for (let i = 0; i < positionArray.length; i += 3) {
            const x = positionArray[i];
            const y = positionArray[i + 1];
            const z = positionArray[i + 2];
            const vector = new THREE.Vector3(x, y, z).normalize();

            // Use Perlin noise to modify vertex positions
            vector.multiplyScalar(
                1 + noise.get3(new THREE.Vector3(
                    vector.x * scale + time * frequency,
                    vector.y * scale + time * frequency,
                    vector.z * scale + time * frequency
                ))
            );

            positionArray[i] = vector.x * size;
            positionArray[i + 1] = vector.y * size;
            positionArray[i + 2] = vector.z * size;
        }

        meshRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[10, 128, 128]} />
            <shaderMaterial
                attach="material"
                args={[material]}
                uniforms-time-value={1}
                uniforms-opacity-value={0.5} // Set opacity value here
            />
        </mesh>
    );
}

function BlackSphere({ size, position }) {
    const meshRef = useRef();

    useFrame(({ clock }) => {
        // Calculate scale based on sine function and time
        const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1; // Adjust amplitude (0.1) for breathing effect
        
        // Update scale of the mesh
        if (meshRef.current) {
            meshRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <sphereGeometry args={[size, 128, 128]} />
            <meshBasicMaterial color="black" />
        </mesh>
    );
}

function Postprocessing() {
    const { gl, scene, camera } = useThree();
    return (
        <EffectComposer>
            <Bloom luminanceThreshold={0.1} luminanceSmoothing={50.9} height={300} opacity={0.5} />
        </EffectComposer>
    );
}

function ThreeScene() {
    return (
        <div>
            <Canvas style={{ height: '30vh', width: '100vw' }}>
                <ambientLight />
                <OrbitControls />
                <Camera position={[800, 60, 800]} />
                <pointLight position={[10, 10, 10]} />

                {/* Black Sphere */}
                <BlackSphere size={300} position={[-70, 0, -70]} />

{/* Colored Spheres */}
{/* <AnimatedSphere frequency={0.1} scale={1} size={180} material={material1} />
<AnimatedSphere frequency={0.2} scale={2} size={180} material={material2} />
<AnimatedSphere frequency={0.3} scale={2} size={180} material={material3} /> */}

            </Canvas>
        </div>
    );
}

export default ThreeScene;
