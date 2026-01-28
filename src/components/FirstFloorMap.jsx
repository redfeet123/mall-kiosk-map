import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Legend from './Legend';

const OFFSET_X = 960;
const OFFSET_Y = 540;

// ✅ Navigation data for future use
const NAVIGATION_DATA = {
    // First floor ke routes yahan add karoge
};

const FirstFloorMap = ({ selectedId, onMapClick, showRoute }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef();
    const objectsRef = useRef([]);
    const controlsRef = useRef();
    const labelRendererRef = useRef();
    const circleTextureRef = useRef(null); // ✅ Texture cache
    const onMapClickRef = useRef(onMapClick);

    useEffect(() => {
        onMapClickRef.current = onMapClick;
    }, [onMapClick]);

    // ✅ Texture helper for routes
    const getCircleTexture = () => {
        if (!circleTextureRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.beginPath();
            ctx.arc(32, 32, 30, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            circleTextureRef.current = new THREE.CanvasTexture(canvas);
        }
        return circleTextureRef.current;
    };

const addLabels = (mesh, props, scene) => {
    if (props.type === 'retail' || props.type === 'food' || props.type === 'fun') {
        const wrapper = document.createElement('div');
        wrapper.className = 'shop-label-wrapper';
        wrapper.dataset.storeId = props.id;
        
        wrapper.innerHTML = `
            <div class="shop-circle">
                <img src="/assets/logos/${props.id}.png" onerror="this.src='/assets/logos/default.png'">
            </div>
            <div class="shop-name-tag">${props.name}</div>
        `;

        const handleClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("🏪 LABEL CLICKED:", props.id, props.name);
            
            if (onMapClickRef.current && typeof onMapClickRef.current === 'function') {
                onMapClickRef.current(props.id);
            }
        };

        wrapper.addEventListener('click', handleClick, false);
        wrapper.addEventListener('mousedown', handleClick, false);
        wrapper.addEventListener('touchend', (e) => {
            e.preventDefault();
            handleClick(e);
        }, false);

        wrapper.addEventListener('mouseenter', () => {
            wrapper.style.transform = 'scale(1.15)';
            wrapper.style.transition = 'transform 0.2s ease';
        });
        
        wrapper.addEventListener('mouseleave', () => {
            wrapper.style.transform = 'scale(1)';
        });

        const label = new CSS2DObject(wrapper);
        mesh.geometry.computeBoundingBox();
        const center = new THREE.Vector3();
        mesh.geometry.boundingBox.getCenter(center);
        
        // ✅ FIX: Label ko thoda upar rakh do (mesh.position.y use kar rahe the, ab fixed height)
        label.position.set(center.x, mesh.position.y + 10 , center.y); // Fixed height instead of mesh.position.y + offset
        
        scene.add(label);
    
            
           
        } else if (props.icon) {
            const textureLoader = new THREE.TextureLoader();
            let iconName = props.icon === 'lift' ? 'elevator' : (props.icon === 'stair' ? 'stairs' : props.icon);
            textureLoader.load(`/assets/icons/${iconName}.svg`, (texture) => {
                const iconGeo = new THREE.PlaneGeometry(80, 80);
                const iconMat = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    depthWrite: false,
                    side: THREE.DoubleSide
                });
                const iconMesh = new THREE.Mesh(iconGeo, iconMat);
                mesh.geometry.computeBoundingBox();
                const center = new THREE.Vector3();
                mesh.geometry.boundingBox.getCenter(center);
                iconMesh.position.set(center.x, mesh.position.y + 1.0, center.y);
                iconMesh.rotation.x = -Math.PI / 2;
                iconMesh.userData = props;
                scene.add(iconMesh);
                objectsRef.current.push(iconMesh);
            });
        }
    };

    useEffect(() => {
        const container = mountRef.current;
        const scene = sceneRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        scene.background = new THREE.Color(0xffffff);

        const aspect = width / height;
        const d = 450;
        const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 5000);
        camera.position.set(800, 500, 800);
        camera.lookAt(0, 0, 0);
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.domElement.style.position = 'absolute';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        container.appendChild(renderer.domElement);

        const labelRenderer = new CSS2DRenderer();
        labelRenderer.setSize(width, height);
        labelRenderer.domElement.style.position = 'absolute';
        labelRenderer.domElement.style.top = '0';
        labelRenderer.domElement.style.left = '0';
        labelRenderer.domElement.style.width = '100%';
        labelRenderer.domElement.style.height = '100%';
        labelRenderer.domElement.style.pointerEvents = 'none';
        labelRenderer.domElement.classList.add('css2d-overlay');
        container.appendChild(labelRenderer.domElement);
        labelRendererRef.current = labelRenderer;

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI / 2.5;
        controls.minZoom = 0.5;
        controls.maxZoom = 2.0;
        controls.saveState();
        controlsRef.current = controls;

        scene.add(new THREE.AmbientLight(0xffffff, 1.5));

        const handlePointer = (e) => {
            if (!cameraRef.current || !mountRef.current) return;
            
            const rect = mountRef.current.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const mouse = new THREE.Vector2(
                ((clientX - rect.left) / rect.width) * 2 - 1,
                -((clientY - rect.top) / rect.height) * 2 + 1
            );

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, cameraRef.current);
            const intersects = raycaster.intersectObjects(objectsRef.current, true);

            if (intersects.length > 0) {
                let target = intersects[0].object;
                
                while (target && !target.userData?.id && target.parent) {
                    target = target.parent;
                }

                const data = target?.userData;

                if (data?.id && !data.id.toLowerCase().includes('e-shop') &&
                    (data.type === 'retail' || data.type === 'food' || data.icon)) {
                    
                    if (onMapClickRef.current) {
                        onMapClickRef.current(data.id);
                    }
                } else {
                    if (onMapClickRef.current) {
                        onMapClickRef.current(null);
                    }
                }
            } else {
                if (onMapClickRef.current) {
                    onMapClickRef.current(null);
                }
            }
        };

        renderer.domElement.addEventListener('click', handlePointer);
        renderer.domElement.addEventListener('touchend', handlePointer);

        const createMesh = (feature) => {
            const props = feature.properties;
            const coords = feature.geometry.coordinates[0];
            const shape = new THREE.Shape();
            shape.moveTo(coords[0][0] - OFFSET_X, coords[0][1] - OFFSET_Y);
            for (let i = 1; i < coords.length; i++) {
                shape.lineTo(coords[i][0] - OFFSET_X, coords[i][1] - OFFSET_Y);
            }

            const geometry = new THREE.ShapeGeometry(shape);

            let mapColor;
            if (props.type === 'path') {
                mapColor = 0xcbd5e1;
            } else if (props.type === 'empty') {
                mapColor = 0xf1f5f9;
            } else if (props.id.toLowerCase().includes('e-shop')) {
                mapColor = 0xe2e8f0;
            } else {
                mapColor = 0xffffff;
            }

            const finalColor = props.id === selectedId ? 0xfee2e2 : mapColor;

            const material = new THREE.MeshBasicMaterial({
                color: finalColor,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: props.id === 'wall' ? 2 : 1,
                polygonOffsetUnits: 1
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = Math.PI / 2;

            if (props.id === 'wall') {
                mesh.position.y = -2;
            } else if (props.type === 'path') {
                mesh.position.y = 0;
            } else {
                mesh.position.y = 1;
            }
            mesh.userData = props;

            const edges = new THREE.EdgesGeometry(geometry);
            mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x64748b })));

            scene.add(mesh);
            objectsRef.current.push(mesh);

            if (!props.id.toLowerCase().includes('e-shop')) {
                addLabels(mesh, props, scene);
            }
        };

        fetch('/assets/maps/first-floor.json')
            .then(res => res.json())
            .then(data => {
                objectsRef.current = [];
                if (data && data.features) {
                    data.features.forEach(createMesh);
                }
                
                setTimeout(() => {
                    labelRenderer.render(scene, camera);
                    
                }, 100);
            });

        const animate = () => {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
            labelRenderer.render(scene, camera);
        };
        animate();

        return () => {
            renderer.domElement.removeEventListener('click', handlePointer);
            renderer.domElement.removeEventListener('touchend', handlePointer);

            // ✅ CRITICAL: Texture cleanup
            if (circleTextureRef.current) {
                circleTextureRef.current.dispose();
                circleTextureRef.current = null;
            }

            scene.traverse((object) => {
                if (object.isMesh) {
                    if (object.geometry) object.geometry.dispose();

                    if (object.material) {
                        const materials = Array.isArray(object.material) ? object.material : [object.material];
                        materials.forEach(mat => {
                            mat.dispose();
                            if (mat.map) mat.map.dispose();
                        });
                    }
                }
            });

            renderer.dispose();
            if (container) container.innerHTML = "";
        };
    }, []);

    useEffect(() => {
        if (!objectsRef.current) return;
        objectsRef.current.forEach(obj => {
            if (obj.userData && obj.material && obj.material.color) {
                let baseColor;
                if (obj.userData.type === 'path') {
                    baseColor = 0xcbd5e1;
                } else if (obj.userData.type === 'empty') {
                    baseColor = 0xf1f5f9;
                } else if (obj.userData.id.toLowerCase().includes('e-shop')) {
                    baseColor = 0xe2e8f0;
                } else {
                    baseColor = 0xffffff;
                }
                const targetColor = obj.userData.id === selectedId ? 0xfee2e2 : baseColor;
                obj.material.color.set(targetColor);
            }
        });
    }, [selectedId]);

    const resetCamera = () => {
        if (cameraRef.current && controlsRef.current) {
            cameraRef.current.position.set(800, 500, 800);
            controlsRef.current.target.set(0, 0, 0);
            cameraRef.current.zoom = 1.0;
            cameraRef.current.updateProjectionMatrix();
            controlsRef.current.update();
        }
    };

    return (
        <section className="map-section" style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div ref={mountRef} className="canvas-container" style={{ width: '100%', height: '100%', position: 'relative' }}></div>
            <div className="map-overlay-title" style={{ pointerEvents: 'none' }}>THE NORTH WALK</div>
            <button onClick={resetCamera} className="reset-view-btn">RESET VIEW</button>
            <Legend />
        </section>
    );
};

export default FirstFloorMap;