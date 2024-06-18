import * as THREE from 'three';

const CustomShaderMaterial = {
    uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color('white') },
        opacity: { value: 0.5 }, // Define opacity as a uniform
        envMap: { value: null }, // Environment map for reflection
        emissiveColor: { value: new THREE.Color('white') }, // Emissive color for glowing effect
    },
    vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
            vNormal = normal;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform float time;
        uniform float opacity; // Add opacity uniform
        uniform samplerCube envMap; // Environment map uniform
        uniform vec3 emissiveColor; // Emissive color uniform
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
            // Reflective color (environment mapping)
            vec3 reflectedColor = textureCube(envMap, reflect(-normalize(vNormal), vec3(0.0, 1.0, 0.0))).rgb;

            // Emissive color (glowing effect)
            vec3 glowingColor = emissiveColor * 0.5 + 0.5 * sin(time * 5.0 + length(vUv) * 10.0);

            // Combine both reflective and emissive colors
            vec3 finalColor = mix(reflectedColor, glowingColor, 0.5);

            // Apply opacity
            gl_FragColor = vec4(finalColor * color, opacity);
        }
    `,
    transparent: true, // Enable transparency
    blending: THREE.AdditiveBlending,
    depthWrite: false, // Disable depth writing to prevent sorting issues
    antialiasing: true,
};

// Create the shader material for hotpink
const material1 = new THREE.ShaderMaterial({
    ...CustomShaderMaterial,
    uniforms: {
        ...THREE.UniformsUtils.clone(CustomShaderMaterial.uniforms),
        color: { value: new THREE.Color('hotpink') },
    },
});

// Create the shader material for yellow
const material2 = new THREE.ShaderMaterial({
    ...CustomShaderMaterial,
    uniforms: {
        ...THREE.UniformsUtils.clone(CustomShaderMaterial.uniforms),
        color: { value: new THREE.Color('yellow') },
    },
});

// Create the shader material for blue
const material3 = new THREE.ShaderMaterial({
    ...CustomShaderMaterial,
    uniforms: {
        ...THREE.UniformsUtils.clone(CustomShaderMaterial.uniforms),
        color: { value: new THREE.Color('blue') },
    },
});

export { material1, material2, material3 };
