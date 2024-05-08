import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const HollowRoom = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Scene
    const scene = new THREE.Scene();
    const drageoffset = new THREE.Vector3();
    const targetPosition = new THREE.Vector3();
    const lerpFactor = 0.1; // Adjust the lerp factor for smoother movement

    // Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    let selectedObject = null;
    var room = null;
    var  floor = null;

    // Load GLB model
    const loader = new GLTFLoader();
    const modelUrl = '/d68ec862-e80f-4a4a-936b-4443e4f4b719.glb';
    loader.load(
      modelUrl,
      function (gltf) {
        const model = gltf.scene;
        model.position.set(0, -0.1, 0); // Set initial position
        scene.add(model);

        // Event listeners for drag-and-drop
     

        function onMouseDown(event) {
          const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
          const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

          const intersects = raycaster.intersectObjects([model], true);
          if (intersects.length > 0) {
            selectedObject = intersects[0].object.parent;
          }
        }

        function onMouseMove(event) {
          if (!selectedObject) return;
          controls.enabled = false;
          const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
          const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

          const intersects = raycaster.intersectObjects(scene.children, true);
          if (intersects.length > 0) {
            const intersection = intersects[0];
            drageoffset.subVectors(selectedObject.position, intersection.point);
            if (selectedObject && selectedObject != room && selectedObject != floor) {
                   
                   targetPosition.copy(selectedObject.position).sub(drageoffset);
                   targetPosition.y= selectedObject.position.y;
                    selectedObject.position.copy(targetPosition);
                  }
            }
        }

        function onMouseUp() {
          selectedObject = null;
          controls.enabled = true;
        }

        document.addEventListener('mousedown', onMouseDown, false);
        document.addEventListener('mousemove', onMouseMove, false);
        document.addEventListener('mouseup', onMouseUp, false);
      },
      undefined,
      function (error) {
        console.error('Error loading model:', error);
      }
    );

    // Room dimensions
    const roomWidth = 8;
    const roomHeight = 3;
    const roomDepth = 6;

    // Room geometry
    const roomGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, roomDepth);

    // Ensure faces array exists before modifying it
    if (roomGeometry.faces !== undefined) {
      // Remove the ceiling by removing top faces
      roomGeometry.faces.splice(8, 2);
      roomGeometry.faceVertexUvs[0].splice(8, 2);
    }

    // Room material
    const roomMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.BackSide });
     room = new THREE.Mesh(roomGeometry, roomMaterial);
    scene.add(room);

    // Floor geometry
    const floorGeometry = new THREE.PlaneGeometry(roomWidth, roomDepth);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc, side: THREE.DoubleSide });
     floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -roomHeight / 2 + 0.01;
    scene.add(floor);

    // Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Resize event listener
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Render function
    const render = () => {
      renderer.render(scene, camera);
    };

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();

    //   if (selectedObject) {
    //     targetPosition.copy(selectedObject.position).sub(drageoffset);
    //     selectedObject.position.lerp(targetPosition, lerpFactor);
    //   }

      render();
    };

    animate();

    // Clean-up
    return () => {
      window.removeEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    };
  }, []);

  return <div ref={canvasRef} />;
};

export default HollowRoom;
