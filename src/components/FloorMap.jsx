import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer';
import Legend from './Legend';

const OFFSET_X = 960;
const OFFSET_Y = 540;

// ✅ Floor-wise Navigation Data
const NAVIGATION_DATA = {
    'ground-floor': {
        'hush_puppies': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 1019, y: 725 },
            // { x: 1016, y: 703 }
        ],
        'sketchers': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 659, y: 722 },
            // { x: 657, y: 703 }
        ],
        'ndure': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 780, y: 726 },
            // { x: 773, y: 702 }
        ],
        'levis': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 875, y: 727 },
            // { x: 869, y: 705 }
        ],
        'bata': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 1126, y: 728 },
            // { x: 1122, y: 702 }
        ],
        'stylo': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 1255, y: 724 },
            // { x: 1246, y: 705 }
        ],
        'companion': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 1431, y: 730 },
            // { x: 1425, y: 709 }
        ],
        'walk_eaze': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 1534, y: 730 },
            // { x: 1528, y: 711 }
        ],
        'mcdonalds': [
            { x: 1349, y: 680 },
            { x: 1354, y: 724 },
            { x: 1655, y: 728 },
            // { x: 1649, y: 709 }
        ],
        'stairs3': [
            { x: 1349, y: 680 },
            { x: 1324, y: 354 },
            { x: 1183, y: 347 },
            // { x: 1185, y: 373 }
        ],
        'stairs4': [
            { x: 1349, y: 680 },
            { x: 1324, y: 354 },
            { x: 1466, y: 348 },
            // { x: 1471, y: 375 }
        ],
        'lift3': [
            { x: 1349, y: 680 },
            { x: 1324, y: 354 },
            { x: 1547, y: 352 },
            // { x: 1550, y: 375 }
        ],

        'lift2': [
            { x: 1349, y: 680 },
            { x: 1324, y: 354 },
            { x: 1091, y: 345 },
            // { x: 1101, y: 375 }
        ],
        'lift1': [
            { x: 1349, y: 680 },
            { x: 1357, y: 724 },
            { x: 952, y: 726 },
            { x: 944, y: 353 },
            { x: 774, y: 348 },
            // { x: 786, y: 374 }
        ],
        'stairs2': [
            { x: 1349, y: 680 },
            { x: 1357, y: 724 },
            { x: 952, y: 726 },
            { x: 944, y: 353 },
            { x: 699, y: 347 },
            // { x: 706, y: 378 }
        ],
        'exit': [
            { x: 1349, y: 680 },
            { x: 1357, y: 724 },
            { x: 596, y: 719 }
        ],

    },
    'first-floor': {
        // First floor ke routes yahan add karoge
    },
    'restaurant-floor': {
        // Restaurant floor ke routes yahan add karoge
    }
};

const FloorMap = ({ floor, selectedId, onMapClick, showRoute }) => {
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef();
    const objectsRef = useRef([]);
    const controlsRef = useRef();
    const labelRendererRef = useRef();
    const circleTextureRef = useRef(null);
    const onMapClickRef = useRef(onMapClick);
    const animationFrameRef = useRef(null);
    const isUnmountingRef = useRef(false);

    useEffect(() => {
        onMapClickRef.current = onMapClick;
    }, [onMapClick]);

    // ✅ "YOU ARE HERE" marker sirf Ground Floor pe
    const addYouAreHere = (scene) => {
        if (floor !== 'ground-floor') return;

        const div = document.createElement('div');
        div.className = 'you-are-here-marker';
        div.innerHTML = `
            <div class="pulse-ring"></div>
            <div class="dot"></div>
            <div class="label">YOU ARE HERE</div>
        `;
        const marker = new CSS2DObject(div);
        const kioskX = 1350;
        const kioskY = 700;
        marker.position.set(kioskX - OFFSET_X, 2, kioskY - OFFSET_Y);
        scene.add(marker);
    };

    const getCircleTexture = () => {
        if (!circleTextureRef.current && !isUnmountingRef.current) {
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

    const drawDynamicRoute = (scene, targetId) => {
        console.log("Drawing route for:", targetId, "on floor:", floor);
        const oldRoute = scene.getObjectByName("active-route");

        if (oldRoute && oldRoute.userData.targetId === targetId) return;

        if (oldRoute) {
            if (oldRoute.geometry) oldRoute.geometry.dispose();
            if (oldRoute.material) {
                if (oldRoute.material.map && oldRoute.material.map !== circleTextureRef.current) {
                    oldRoute.material.map.dispose();
                }
                oldRoute.material.dispose();
            }
            scene.remove(oldRoute);
        }

        const pathPoints = NAVIGATION_DATA[floor]?.[targetId];
        if (!pathPoints) {
            console.warn("No path data found for ID:", targetId, "on floor:", floor);
            return;
        }

        const cornerPoints = pathPoints.map(p => new THREE.Vector3(p.x - OFFSET_X, 5, p.y - OFFSET_Y));
        const straightPoints = [];
        for (let i = 0; i < cornerPoints.length - 1; i++) {
            const start = cornerPoints[i];
            const end = cornerPoints[i + 1];
            const distance = start.distanceTo(end);
            const segments = Math.max(Math.floor(distance / 20), 2);
            for (let j = 0; j <= segments; j++) {
                straightPoints.push(new THREE.Vector3().lerpVectors(start, end, j / segments));
            }
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(straightPoints);
        const material = new THREE.PointsMaterial({
            color: 0x000000,
            size: 10,
            map: getCircleTexture(),
            transparent: true,
            alphaTest: 0.1,
            sizeAttenuation: true,
            depthWrite: false
        });

        const route = new THREE.Points(geometry, material);
        route.name = "active-route";
        route.renderOrder = 9999;

        route.userData = {
            targetId: targetId,
            currentPoint: 0,
            totalPoints: straightPoints.length,
            drawSpeed: 0.2,
            isFullyDrawn: false,
            glowOffset: 0,
            isGlowDone: false
        };

        route.geometry.setDrawRange(0, 0);
        scene.add(route);
    };

    const addLabels = (mesh, props, scene) => {
        if (props.type === 'retail' || props.type === 'food' || props.type === 'fun' || props.type === 'banking') {
            // ✅ First floor ke e-shop ko skip karo
            if (floor === 'first-floor' && props.id.toLowerCase().includes('e-shop')) {
                return;
            }

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
                if (onMapClickRef.current) {
                    onMapClickRef.current(props.id);
                }
            };

            wrapper.addEventListener('click', handleClick, false);
            wrapper.addEventListener('touchend', (e) => {
                e.preventDefault();
                handleClick(e);
            }, false);

            const label = new CSS2DObject(wrapper);
            mesh.geometry.computeBoundingBox();
            const center = new THREE.Vector3();
            mesh.geometry.boundingBox.getCenter(center);

            label.position.set(center.x, mesh.position.y + 10, center.y);
            scene.add(label);

        } else if (props.icon) {
            const textureLoader = new THREE.TextureLoader();
            let iconName = props.icon === 'lift' ? 'elevator' : (props.icon === 'stair' ? 'stairs' : props.icon);
            textureLoader.load(`/assets/icons/${iconName}.svg`, (texture) => {
                if (isUnmountingRef.current) {
                    texture.dispose();
                    return;
                }
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
        isUnmountingRef.current = false;
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

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            precision: "highp",
            powerPreference: "high-performance"
        });
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
        controls.dampingFactor = 0.15;
        controls.maxPolarAngle = Math.PI / 2.5;
        controls.minZoom = 0.5;
        controls.maxZoom = 2.0;
        controlsRef.current = controls;

        scene.add(new THREE.AmbientLight(0xffffff, 1.5));

        const handlePointer = (e) => {
            console.log("Screen Clicked!");
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

            // Ground plane coordinates (for debugging)
            const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
            const intersectPoint = new THREE.Vector3();
            raycaster.ray.intersectPlane(groundPlane, intersectPoint);

            if (intersectPoint) {
                const actualX = Math.round(intersectPoint.x + OFFSET_X);
                const actualY = Math.round(intersectPoint.z + OFFSET_Y);
                console.log(`{ x: ${actualX}, y: ${actualY} },`);
            }

            const mapIntersects = raycaster.intersectObjects(objectsRef.current, true);

            if (mapIntersects.length > 0) {
                let target = mapIntersects[0].object;

                while (target && !target.userData?.id && target.parent) {
                    target = target.parent;
                }

                const data = target?.userData;

                if (data?.id) {
                    console.log("Clicked ID:", data.id);
                    if (onMapClickRef.current) {
                        onMapClickRef.current(data.id);
                    }
                } else {
                    // ✅ Plain surface (no ID) clicked - clear selection
                    if (onMapClickRef.current) {
                        onMapClickRef.current(null);
                    }
                }
            } else {
                // ✅ Empty area clicked - clear selection
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

            // ✅ Floor-specific color logic
            let mapColor;
            if (props.type === 'path') {
                mapColor = 0xcbd5e1;
            } else if (props.type === 'empty') {
                mapColor = floor === 'first-floor' ? 0xf1f5f9 : 0xe2e8f0;
            } else if (floor === 'first-floor' && props.id.toLowerCase().includes('e-shop')) {
                mapColor = 0xe2e8f0;
            } else {
                mapColor = 0xffffff;
            }

            const material = new THREE.MeshBasicMaterial({
                color: mapColor,
                side: THREE.DoubleSide,
                polygonOffset: true,
                polygonOffsetFactor: (floor === 'first-floor' && props.id === 'wall') ? 2 : 1,
                polygonOffsetUnits: 1
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.x = Math.PI / 2;

            // ✅ Floor-specific positioning
            if (floor === 'first-floor' && props.id === 'wall') {
                mesh.position.y = -2;
            } else if (floor === 'restaurant-floor' && props.id.includes('wall')) {
                mesh.position.y = -2;
            } else if (props.type === 'path') {
                mesh.position.y = 0;
            } else {
                mesh.position.y = floor === 'restaurant-floor' ? 2 : (floor === 'first-floor' ? 1 : 2);
            }

            mesh.userData = props;

            const edges = new THREE.EdgesGeometry(geometry);
            mesh.add(new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x64748b })));

            scene.add(mesh);
            objectsRef.current.push(mesh);
            addLabels(mesh, props, scene);
        };

        // ✅ Dynamically load floor JSON
        fetch(`/assets/maps/${floor}.json`)
            .then(res => res.json())
            .then(data => {
                if (isUnmountingRef.current) return;
                objectsRef.current = [];
                data.features.forEach(createMesh);
                addYouAreHere(scene);

                setTimeout(() => {
                    if (!isUnmountingRef.current) {
                        labelRenderer.render(scene, camera);
                    }
                }, 100);
            });

        const animate = () => {
            if (isUnmountingRef.current) return;

            animationFrameRef.current = requestAnimationFrame(animate);

            if (controlsRef.current) {
                controlsRef.current.update();
            }

            // Route animation
            const activeRoute = scene.getObjectByName("active-route");
            if (activeRoute && activeRoute.material) {
                const data = activeRoute.userData;
                if (!data.isFullyDrawn) {
                    data.currentPoint += data.drawSpeed;
                    const drawCount = Math.min(Math.floor(data.currentPoint), data.totalPoints);
                    activeRoute.geometry.setDrawRange(0, drawCount);
                    if (data.currentPoint >= data.totalPoints) data.isFullyDrawn = true;
                } else if (!data.isGlowDone) {
                    data.glowOffset += 0.05;
                    const pulse = Math.sin(data.glowOffset);
                    activeRoute.material.opacity = 0.7 + pulse * 0.3;
                    activeRoute.material.size = 12 + pulse * 4;
                    if (data.glowOffset >= Math.PI) {
                        data.isGlowDone = true;
                        activeRoute.material.opacity = 0.9;
                        activeRoute.material.size = 12;
                    }
                }
            }

            cameraRef.current.updateMatrixWorld();
            renderer.render(scene, cameraRef.current);
            labelRendererRef.current.render(scene, cameraRef.current);
        };

        animate();

        return () => {
            isUnmountingRef.current = true;

            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }

            renderer.domElement.removeEventListener('click', handlePointer);
            renderer.domElement.removeEventListener('touchend', handlePointer);

            const activeRoute = scene.getObjectByName("active-route");
            if (activeRoute) {
                if (activeRoute.geometry) activeRoute.geometry.dispose();
                if (activeRoute.material) {
                    if (activeRoute.material.map && activeRoute.material.map !== circleTextureRef.current) {
                        activeRoute.material.map.dispose();
                    }
                    activeRoute.material.dispose();
                }
                scene.remove(activeRoute);
            }

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
                            if (mat.map) mat.map.dispose();
                            mat.dispose();
                        });
                    }
                }
            });

            renderer.dispose();
            controls.dispose();

            if (container) {
                container.innerHTML = "";
            }
        };
    }, [floor]); // ✅ Floor change hone par reload

    useEffect(() => {
        objectsRef.current.forEach(obj => {
            if (obj.userData && obj.material?.color) {
                let baseColor;
                if (obj.userData.type === 'path') {
                    baseColor = 0xcbd5e1;
                } else if (obj.userData.type === 'empty') {
                    baseColor = floor === 'first-floor' ? 0xf1f5f9 : 0xe2e8f0;
                } else if (floor === 'first-floor' && obj.userData.id.toLowerCase().includes('e-shop')) {
                    baseColor = 0xe2e8f0;
                } else {
                    baseColor = 0xffffff;
                }
                const targetColor = obj.userData.id === selectedId ? 0xfee2e2 : baseColor;
                obj.material.color.set(targetColor);
            }
        });

        const scene = sceneRef.current;
        const oldRoute = scene.getObjectByName("active-route");

        if (showRoute && selectedId && NAVIGATION_DATA[floor]?.[selectedId]) {
            console.log("Drawing route for:", selectedId);
            drawDynamicRoute(scene, selectedId);
        } else {
            console.log("Route conditions not met", { showRoute, selectedId });
            if (oldRoute) {
                if (oldRoute.geometry) oldRoute.geometry.dispose();
                if (oldRoute.material) {
                    if (oldRoute.material.map && oldRoute.material.map !== circleTextureRef.current) {
                        oldRoute.material.map.dispose();
                    }
                    oldRoute.material.dispose();
                }
                scene.remove(oldRoute);
            }
        }
    }, [selectedId, showRoute, floor]);

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

export default FloorMap;
