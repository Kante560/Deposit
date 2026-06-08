"use client";

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CyberHUD() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Scene Setup
    const scene = new THREE.Scene();
    // Background is transparent to blend with AnoAI
    
    // Camera
    const camera = new THREE.PerspectiveCamera(45, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 50;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Groups
    const coreGroup = new THREE.Group();
    const ringsGroup = new THREE.Group();
    const tracesGroup = new THREE.Group();
    const particlesGroup = new THREE.Group();
    scene.add(coreGroup, ringsGroup, tracesGroup, particlesGroup);

    // 1. Central Core Lock (SDF Shader on a Plane)
    const lockGeometry = new THREE.PlaneGeometry(20, 20);
    const lockMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('#ffffff') }, // Bright white core
        uGlow: { value: new THREE.Color('#00b7ff') }   // Cyan glow
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform vec3 uColor;
        uniform vec3 uGlow;

        // Keyhole SDF
        float sdKeyhole(vec2 p) {
            float c = length(p - vec2(0.0, 0.15)) - 0.2;
            float width = mix(0.12, 0.22, smoothstep(0.0, -0.4, p.y));
            float t = max(abs(p.x) - width, p.y - 0.05);
            t = max(t, -p.y - 0.4);
            return min(c, t);
        }

        void main() {
            vec2 p = vUv * 2.0 - 1.0;
            float d = sdKeyhole(p);
            
            // Sharp Core
            float core = 1.0 - smoothstep(0.0, 0.015, d);
            
            // Soft Glow (breathing)
            float pulse = 0.8 + 0.2 * sin(uTime * 2.0);
            float glowDist = smoothstep(0.0, 0.6, d);
            float glow = exp(-d * 6.0) * pulse * 0.8;
            
            vec3 color = mix(uGlow, uColor, core);
            float alpha = core + glow;
            
            gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
        }
      `
    });
    const lockMesh = new THREE.Mesh(lockGeometry, lockMaterial);
    coreGroup.add(lockMesh);

    // 2. HUD Rings
    const createRing = (inner: number, outer: number, dashCount: number, speed: number, color: string, opacity: number = 0.8) => {
      const geometry = new THREE.RingGeometry(inner, outer, 64);
      const material = new THREE.ShaderMaterial({
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: opacity }
        },
        vertexShader: `
          varying vec3 vPos;
          void main() {
            vPos = position;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          uniform vec3 uColor;
          uniform float uOpacity;
          void main() {
            float angle = atan(vPos.y, vPos.x);
            // Dashed effect: if dashCount is 0, sin returns 0 so step(0, 0) is 1.
            float dash = sin(angle * ${dashCount.toFixed(1)});
            float alpha = ${dashCount === 0 ? '1.0' : 'step(0.0, dash)'};
            if (alpha < 0.5) discard;
            gl_FragColor = vec4(uColor, uOpacity);
          }
        `
      });
      const mesh = new THREE.Mesh(geometry, material);
      (mesh as any).userData = { speed };
      return mesh;
    };

    ringsGroup.add(createRing(8.5, 8.7, 0, 0.15, '#00d2ff', 0.5)); // Inner solid thin
    ringsGroup.add(createRing(9.5, 12, 60, -0.05, '#0055ff', 0.3)); // Thick dashed blue
    ringsGroup.add(createRing(13, 13.2, 16, 0.08, '#ffffff', 0.7)); // Outer dashed white
    ringsGroup.add(createRing(14, 14.1, 0, -0.1, '#00d2ff', 0.2)); // Outer thin boundary
    
    // 3. Decorative Arc Elements
    const arcGeo = new THREE.RingGeometry(15, 15.3, 64, 1, 0, Math.PI * 0.6);
    const arcMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.8 });
    const arcMesh = new THREE.Mesh(arcGeo, arcMat);
    (arcMesh as any).userData = { speed: 0.2 };
    ringsGroup.add(arcMesh);

    const arcGeo2 = new THREE.RingGeometry(16, 16.2, 64, 1, Math.PI, Math.PI * 0.4);
    const arcMat2 = new THREE.MeshBasicMaterial({ color: '#00a2ff', side: THREE.DoubleSide, transparent: true, opacity: 0.6 });
    const arcMesh2 = new THREE.Mesh(arcGeo2, arcMat2);
    (arcMesh2 as any).userData = { speed: -0.15 };
    ringsGroup.add(arcMesh2);

    // 4. Circuit Traces
    const tracesMat = new THREE.LineBasicMaterial({ color: '#00b7ff', transparent: true, opacity: 0.5 });
    const tracesGeo = new THREE.BufferGeometry();
    const tracePoints: number[] = [];
    
    // Procedurally generate 45-degree angled lines
    for(let i=0; i<12; i++) {
        const signX = i % 2 === 0 ? 1 : -1;
        const signY = i % 4 < 2 ? 1 : -1;
        
        const startX = signX * (14 + Math.random() * 4);
        const startY = signY * (Math.random() * 4);
        
        const length1 = 3 + Math.random() * 5;
        const midX = startX + signX * length1;
        const midY = startY;
        
        const length2 = 5 + Math.random() * 5;
        const endX = midX + signX * length2;
        const endY = midY + signY * length2;
        
        tracePoints.push(startX, startY, 0);
        tracePoints.push(midX, midY, 0);
        
        tracePoints.push(midX, midY, 0);
        tracePoints.push(endX, endY, 0);
    }
    tracesGeo.setAttribute('position', new THREE.Float32BufferAttribute(tracePoints, 3));
    const tracesLine = new THREE.LineSegments(tracesGeo, tracesMat);
    tracesGroup.add(tracesLine);

    // 5. Light Pulses on Traces
    const lightPulseMat = new THREE.PointsMaterial({ color: '#ffffff', size: 0.5, transparent: true, opacity: 0.8 });
    const lightPulseGeo = new THREE.BufferGeometry();
    const lightPulsePoints: number[] = [];
    // We will place points on the trace paths and animate them in the loop.
    for(let i=0; i<8; i++) {
        lightPulsePoints.push(0, 0, 0); // initial
    }
    lightPulseGeo.setAttribute('position', new THREE.Float32BufferAttribute(lightPulsePoints, 3));
    const lightPulseMesh = new THREE.Points(lightPulseGeo, lightPulseMat);
    tracesGroup.add(lightPulseMesh);

    // 6. Ambient Particles
    const particleGeo = new THREE.BufferGeometry();
    const pCount = 150;
    const pPos = new Float32Array(pCount * 3);
    const pAlphas = new Float32Array(pCount);
    for(let i=0; i<pCount; i++) {
        pPos[i*3] = (Math.random() - 0.5) * 60;
        pPos[i*3+1] = (Math.random() - 0.5) * 40;
        pPos[i*3+2] = (Math.random() - 0.5) * 20 - 5; // pushed back slightly
        pAlphas[i] = Math.random();
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    particleGeo.setAttribute('aAlpha', new THREE.BufferAttribute(pAlphas, 1));
    
    const particleMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#88ccff') }
        },
        vertexShader: `
            attribute float aAlpha;
            varying float vAlpha;
            void main() {
                vAlpha = aAlpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = 3.0 * (50.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform float uTime;
            varying float vAlpha;
            void main() {
                // soft circle
                float dist = length(gl_PointCoord - vec2(0.5));
                if (dist > 0.5) discard;
                
                float twinkle = 0.5 + 0.5 * sin(uTime * 4.0 + vAlpha * 20.0);
                gl_FragColor = vec4(uColor, vAlpha * twinkle * (1.0 - dist*2.0));
            }
        `
    });
    const particleMesh = new THREE.Points(particleGeo, particleMat);
    particlesGroup.add(particleMesh);

    // Animation Loop
    let animationFrameId: number;
    let lastTime = 0;

    const renderLoop = (time: number) => {
        const elapsedTime = time * 0.001;
        const delta = elapsedTime - lastTime;
        lastTime = elapsedTime;

        // Update Uniforms
        lockMaterial.uniforms.uTime.value = elapsedTime;
        particleMat.uniforms.uTime.value = elapsedTime;

        // Rotate Rings
        ringsGroup.children.forEach(child => {
            if (child.userData.speed) {
                child.rotation.z += child.userData.speed * delta;
            }
        });

        // Drift Particles
        const positions = particleMesh.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<pCount; i++) {
            positions[i*3+1] += 0.5 * delta;
            // loop around
            if (positions[i*3+1] > 20) {
                positions[i*3+1] = -20;
            }
        }
        particleMesh.geometry.attributes.position.needsUpdate = true;

        // Animate Light Pulses along traces (simple hack: moving them along x axis, binding to y)
        const pulsePositions = lightPulseMesh.geometry.attributes.position.array as Float32Array;
        for(let i=0; i<8; i++) {
            // just move them from center outwards randomly resetting
            let px = pulsePositions[i*3];
            let py = pulsePositions[i*3+1];
            
            px += (i % 2 === 0 ? 1 : -1) * 5 * delta;
            
            // if too far, reset to near center
            if (Math.abs(px) > 25) {
                px = (i % 2 === 0 ? 1 : -1) * (10 + Math.random() * 2);
                py = (Math.random() - 0.5) * 10;
            }
            
            pulsePositions[i*3] = px;
            pulsePositions[i*3+1] = py;
        }
        lightPulseMesh.geometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(renderLoop);
    };
    
    animationFrameId = requestAnimationFrame(renderLoop);

    // Resize Handler
    const handleResize = () => {
        if (!mountRef.current) return;
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mountRef.current);

    // Cleanup
    return () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        if (mountRef.current && renderer.domElement) {
            mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.clear();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full relative flex items-center justify-center"
    />
  );
}
