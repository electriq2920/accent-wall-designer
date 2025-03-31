'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Room type furniture configurations
const ROOM_FURNITURE = {
  livingRoom: [
    { type: 'sofa', position: [0, 0, -3], size: [3, 1, 1] },
    { type: 'coffeeTable', position: [0, 0, -5], size: [2, 0.5, 1] },
    { type: 'plant', position: [3, 0, -2], size: [0.7, 2, 0.7] }
  ],
  bedroom: [
    { type: 'bed', position: [0, 0, -4], size: [3.5, 0.8, 5.5] },
    { type: 'nightstand', position: [2.5, 0, -4], size: [1, 0.7, 1] },
    { type: 'nightstand', position: [-2.5, 0, -4], size: [1, 0.7, 1] },
    { type: 'dresser', position: [-3, 0, -1], size: [1.5, 1.2, 3] }
  ],
  office: [
    { type: 'desk', position: [0, 0, -4], size: [3, 0.8, 1.5] },
    { type: 'chair', position: [0, 0, -2.5], size: [1, 1.5, 1] },
    { type: 'bookshelf', position: [3, 0, -1], size: [1.5, 3, 0.8] },
    { type: 'plant', position: [-3, 0, -1], size: [0.7, 2, 0.7] }
  ],
  diningRoom: [
    { type: 'diningTable', position: [0, 0, -4], size: [3.5, 0.8, 1.8] },
    { type: 'chair', position: [1.5, 0, -3], size: [0.8, 1.2, 0.8] },
    { type: 'chair', position: [-1.5, 0, -3], size: [0.8, 1.2, 0.8] },
    { type: 'chair', position: [1.5, 0, -5], size: [0.8, 1.2, 0.8] },
    { type: 'chair', position: [-1.5, 0, -5], size: [0.8, 1.2, 0.8] },
    { type: 'sideboard', position: [-3, 0, -1], size: [1.2, 1, 4] }
  ]
};

// Furniture color configurations
const FURNITURE_COLORS = {
  sofa: 0x8f8f8f,
  coffeeTable: 0x5d4037,
  plant: 0x2e7d32,
  bed: 0xe0e0e0,
  nightstand: 0x795548, 
  dresser: 0x795548,
  desk: 0x5d4037,
  chair: 0x424242,
  bookshelf: 0x795548,
  diningTable: 0x5d4037,
  sideboard: 0x795548
};

export default function EnhancedRoomVisualizer({ config }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const roomMeshesRef = useRef({});
  const materialsRef = useRef({});
  const furnitureRef = useRef({});
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('default');
  
  // Setup Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Get container dimensions
    const container = canvasRef.current.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf7f7f7);
    sceneRef.current = scene;
    
    // Create camera with wider field of view
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18); // Position camera further back to zoom out
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current,
      antialias: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    
    // Setup lighting
    setupLighting(scene);
    
    // Create controls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 1.5; // Restrict vertical rotation
    controls.minDistance = 4;
    controls.maxDistance = 25; // Allow zooming out further
    
    // Animation loop with explicit rendering
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update controls
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
      if (!canvasRef.current) return;
      const container = canvasRef.current.parentElement;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Cleanup
      if (renderer) renderer.dispose();
      
      // Dispose materials and geometries
      Object.values(materialsRef.current).forEach(material => {
        material.dispose();
      });
      
      Object.values(roomMeshesRef.current).forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose();
        scene.remove(mesh);
      });
    };
  }, []);
  
  // Update the lighting to improve white color rendering
  const setupLighting = (scene) => {
    // Clear any existing lights
    scene.children = scene.children.filter(child => !(child instanceof THREE.Light));
    
    // Main directional light (simulates sunlight)
    const mainLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    mainLight.position.set(0, 10, 10);
    scene.add(mainLight);
    
    // Front fill light to reduce shadows
    const fillLight = new THREE.DirectionalLight(0xFFFFFF, 0.7);
    fillLight.position.set(0, 0, 20);
    scene.add(fillLight);
    
    // Add a subtle ambient light to illuminate everything evenly
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.7);
    scene.add(ambientLight);
    
    // Top light to highlight the wall better
    const topLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    topLight.position.set(0, 20, 0);
    scene.add(topLight);
    
    return scene;
  };
  
  // Create room based on config
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    const createRoomWithConfig = () => {
      setIsLoading(true);
      try {
        // Clear existing room objects
        clearRoom(scene);
        
        // Create new room with colors
        createRoom(scene, {
          width: config.width,
          height: config.height,
          accentWallColor: config.accentWallColor,
          sideWallColor: config.sideWallColor,
          mouldingColor: config.mouldingColor,
          mouldingType: config.mouldingType,
          mouldingWidth: config.mouldingWidth,
          patternRepeats: config.patternRepeats,
          roomType: config.roomType
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error creating room:', error);
        // Create fallback room with basic colors
        clearRoom(scene);
        createRoom(scene, {
          width: config.width,
          height: config.height,
          accentWallColor: '#ffffff',
          sideWallColor: '#f5f5f5',
          mouldingColor: '#ffffff'
        });
        setIsLoading(false);
      }
    };
    
    createRoomWithConfig();
    
  }, [config]);
  
  // Clear existing room objects
  const clearRoom = (scene) => {
    // Remove meshes
    Object.values(roomMeshesRef.current).forEach(mesh => {
      scene.remove(mesh);
    });
    
    // Remove furniture meshes
    Object.values(furnitureRef.current).forEach(mesh => {
      scene.remove(mesh);
    });
    
    // Dispose materials and geometries
    Object.values(materialsRef.current).forEach(material => {
      material.dispose();
    });
    
    roomMeshesRef.current = {};
    materialsRef.current = {};
    furnitureRef.current = {};
  };
  
  // Create the moulding material with improved settings
  const createMouldingMaterial = (color) => {
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.1,          // Make it more shiny (less rough)
      metalness: 0,            // Not metallic
      flatShading: false,      // Smooth shading
      side: THREE.DoubleSide   // Render both sides
    });
    
    return material;
  };
  
  // Create room with colors
  const createRoom = (scene, options) => {
    const {
      width = 10,
      height = 8,
      accentWallColor = '#ffffff',
      sideWallColor = '#f5f5f5',
      mouldingColor = '#ffffff',
      mouldingType = 'classic',
      mouldingWidth = 0.05,
      patternRepeats = { horizontal: 1, vertical: 1 },
      roomType = 'livingRoom'
    } = options;
    
    // Convert colors to a format Three.js can handle
    const convertColor = (colorStr) => {
      try {
        // If it's already a hex color, just return it
        if (colorStr.startsWith('#')) {
          return new THREE.Color(colorStr);
        }
        
        // For other formats (rgb, oklch, etc.), create a temporary element to convert
        const tempEl = document.createElement('div');
        tempEl.style.color = colorStr;
        document.body.appendChild(tempEl);
        const computedColor = window.getComputedStyle(tempEl).color;
        document.body.removeChild(tempEl);
        
        return new THREE.Color(computedColor);
      } catch (e) {
        console.error('Color conversion error:', e);
        return new THREE.Color('#ffffff'); // Default to white
      }
    };
    
    const accentWallThreeColor = convertColor(accentWallColor);
    const sideWallThreeColor = convertColor(sideWallColor);
    const mouldingThreeColor = convertColor(mouldingColor);
    
    // Use actual dimensions
    const roomWidth = width;
    const roomHeight = height;
    const roomDepth = 10;
    const wallThickness = 0.1;
    
    // Create floor
    const floorGeometry = new THREE.BoxGeometry(roomWidth, 0.2, roomDepth);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.8,
      metalness: 0.2
    });
    
    materialsRef.current.floor = floorMaterial;
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -roomHeight / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    roomMeshesRef.current.floor = floor;
    
    // Create back wall (accent wall)
    const backWallGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness);
    const backWallMaterial = new THREE.MeshStandardMaterial({
      color: accentWallThreeColor,
      roughness: 0.7,
      metalness: 0.1
    });
    
    materialsRef.current.backWall = backWallMaterial;
    
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.z = -roomDepth / 2;
    backWall.receiveShadow = true;
    scene.add(backWall);
    roomMeshesRef.current.backWall = backWall;
    
    // Create moulding overlay for accent wall
    createMouldingOverlay(
      scene, 
      mouldingType, 
      roomWidth, 
      roomHeight, 
      roomDepth, 
      mouldingThreeColor, 
      mouldingWidth, 
      patternRepeats
    );
    
    // Create left wall (side wall)
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth);
    const sideWallMaterial = new THREE.MeshStandardMaterial({
      color: sideWallThreeColor,
      roughness: 0.7,
      metalness: 0.1
    });
    
    materialsRef.current.sideWall = sideWallMaterial;
    
    const leftWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
    leftWall.position.x = -roomWidth / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    roomMeshesRef.current.leftWall = leftWall;
    
    // Update camera position to frame the room based on size
    if (cameraRef.current) {
      const distanceFactor = Math.max(1, roomWidth / 10);
      const camera = cameraRef.current;
      // Move camera to a fixed diagonal angle but adjusted for room size - zoomed out more
      camera.position.set(roomWidth * 0.8, roomHeight * 0.6, roomDepth * 0.8);
      camera.lookAt(0, 0, -roomDepth / 3);
    }
  };

  // Create moulding pattern overlay
  const createMouldingOverlay = (
    scene, 
    mouldingType, 
    width, 
    height, 
    depth, 
    mouldingColor, 
    mouldingWidth, 
    patternRepeats
  ) => {
    const mouldingGroup = createMouldingPattern(
      width,
      height,
      depth,
      mouldingType,
      mouldingColor,
      mouldingWidth,
      patternRepeats
    );
    
    mouldingGroup.castShadow = true;
    mouldingGroup.receiveShadow = true;
    scene.add(mouldingGroup);
    roomMeshesRef.current.moulding = mouldingGroup;
  };
  
  // Create moulding pattern
  const createMouldingPattern = (width, height, depth, mouldingType, mouldingColor, mouldingWidth, patternRepeats) => {
    const mouldingGroup = new THREE.Group();
    
    // For better white color and material appearance
    const mouldingMaterial = createMouldingMaterial(mouldingColor);
    
    let createPatternFunc;
    
    switch(mouldingType) {
      case 'classic':
        createPatternFunc = createClassicMoulding;
        break;
      case 'modern':
        createPatternFunc = createModernMoulding;
        break;
      case 'geometric':
        createPatternFunc = createGeometricMoulding;
        break;
      case 'diamond':
        createPatternFunc = createDiamondMoulding;
        break;
      case 'rectangular':
        createPatternFunc = createRectangularMoulding;
        break;
      case 'grid':
        createPatternFunc = createGridMoulding;
        break;
      case 'chevron':
        createPatternFunc = createChevronMoulding;
        break;
      case 'herringbone':
        createPatternFunc = createHerringboneMoulding;
        break;
      case 'coffered':
        createPatternFunc = createCofferedMoulding;
        break;
      case 'wainscoting':
        createPatternFunc = createWainscotingMoulding;
        break;
      case 'shiplap':
        createPatternFunc = createShiplapMoulding;
        break;
      case 'diagonalCross':
        createPatternFunc = createDiagonalCrossMoulding;
        break;
      case 'verticalSlat':
        createPatternFunc = createVerticalSlatMoulding;
        break;
      case 'geometricSquares':
        createPatternFunc = createGeometricSquaresMoulding;
        break;
      default:
        createPatternFunc = createClassicMoulding;
    }
    
    // For patterns that cover the entire wall rather than repeating
    const fullWallPatterns = ['wainscoting', 'shiplap', 'coffered', 'verticalSlat', 'modern', 'herringbone', 'diagonalCross'];
    
    if (fullWallPatterns.includes(mouldingType)) {
      const pattern = createPatternFunc(width, height, mouldingWidth, mouldingMaterial);
      pattern.position.set(0, 0, -depth / 2 + 0.06); // Position at the wall
      mouldingGroup.add(pattern);
    } else {
      // Calculate pattern sizes based on repetition
      const patternWidth = width / patternRepeats.horizontal;
      const patternHeight = height / patternRepeats.vertical;
      // Create repeating patterns
      for (let h = 0; h < patternRepeats.horizontal; h++) {
        for (let v = 0; v < patternRepeats.vertical; v++) {
          const offsetX = (h * patternWidth) - (width / 2) + (patternWidth / 2);
          const offsetY = (v * patternHeight) - (height / 2) + (patternHeight / 2);
          const pattern = createPatternFunc(patternWidth, patternHeight, mouldingWidth, mouldingMaterial);
          pattern.position.set(offsetX, offsetY, -depth / 2 + 0.06);
          mouldingGroup.add(pattern);
        }
      }
    }
    
    return mouldingGroup;
  };
  
  // Pattern creation functions
  const createClassicMoulding = (width, height, mouldingWidth, material) => {
    const borderWidth = width * mouldingWidth;
    const frame = new THREE.Shape();
    
    // Outer rectangle
    frame.moveTo(-width/2, -height/2);
    frame.lineTo(width/2, -height/2);
    frame.lineTo(width/2, height/2);
    frame.lineTo(-width/2, height/2);
    frame.lineTo(-width/2, -height/2);
    
    // Inner hole
    const hole = new THREE.Path();
    hole.moveTo(-width/2 + borderWidth, -height/2 + borderWidth);
    hole.lineTo(width/2 - borderWidth, -height/2 + borderWidth);
    hole.lineTo(width/2 - borderWidth, height/2 - borderWidth);
    hole.lineTo(-width/2 + borderWidth, height/2 - borderWidth);
    hole.lineTo(-width/2 + borderWidth, -height/2 + borderWidth);
    frame.holes.push(hole);
    
    const geometry = new THREE.ShapeGeometry(frame);
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
  };
  
  const createModernMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const lineWidth = width * 0.98; // Extend almost full width
    const lineThickness = height * mouldingWidth * 1.2;
    
    // Horizontal lines - 3 evenly spaced
    for (let i = 1; i < 4; i++) {
      const y = (height * i / 4) - height/2;
      
      const lineGeometry = new THREE.BoxGeometry(lineWidth, lineThickness, 0.05);
      const line = new THREE.Mesh(lineGeometry, material);
      line.position.set(0, y, 0);
      group.add(line);
    }
    
    // Vertical line - full height
    const vertLineGeometry = new THREE.BoxGeometry(lineThickness, height * 0.98, 0.05);
    const vertLine = new THREE.Mesh(vertLineGeometry, material);
    group.add(vertLine);
    
    return group;
  };
  
  const createGeometricMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const size = Math.min(width, height) * 0.15;
    const thickness = mouldingWidth * 10;
    
    // Create a diamond pattern
    for (let x = -2; x <= 2; x++) {
      for (let y = -2; y <= 2; y++) {
        if ((x + y) % 2 === 0) continue; // Skip every other position for checkerboard
        
        const posX = x * (width / 4);
        const posY = y * (height / 4);
        
        const geometry = new THREE.BoxGeometry(size, size, thickness);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(posX, posY, 0);
        mesh.rotation.z = Math.PI / 4; // Rotate to diamond shape
        group.add(mesh);
      }
    }
    
    return group;
  };
  
  const createGridMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const lineThickness = Math.max(width, height) * mouldingWidth * 0.3;
    
    // Horizontal lines
    for (let i = 0; i <= 3; i++) {
      const y = (height * i / 3) - height/2;
      
      const lineGeometry = new THREE.BoxGeometry(width, lineThickness, 0.05);
      const line = new THREE.Mesh(lineGeometry, material);
      line.position.set(0, y, 0);
      group.add(line);
    }
    
    // Vertical lines
    for (let i = 0; i <= 3; i++) {
      const x = (width * i / 3) - width/2;
      
      const lineGeometry = new THREE.BoxGeometry(lineThickness, height, 0.05);
      const line = new THREE.Mesh(lineGeometry, material);
      line.position.set(x, 0, 0);
      group.add(line);
    }
    
    return group;
  };
  
  const createDiamondMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const diamondSize = Math.min(width, height) * 0.5;
    const thickness = 0.05;
    
    // Create diamond shape
    const diamondShape = new THREE.Shape();
    diamondShape.moveTo(0, diamondSize/2);
    diamondShape.lineTo(diamondSize/2, 0);
    diamondShape.lineTo(0, -diamondSize/2);
    diamondShape.lineTo(-diamondSize/2, 0);
    diamondShape.lineTo(0, diamondSize/2);
    
    // Create a smaller inner diamond for cutout
    const innerSize = diamondSize * (1 - mouldingWidth * 2);
    const hole = new THREE.Path();
    hole.moveTo(0, innerSize/2);
    hole.lineTo(innerSize/2, 0);
    hole.lineTo(0, -innerSize/2);
    hole.lineTo(-innerSize/2, 0);
    hole.lineTo(0, innerSize/2);
    diamondShape.holes.push(hole);
    
    const geometry = new THREE.ShapeGeometry(diamondShape);
    const mesh = new THREE.Mesh(geometry, material);
    group.add(mesh);
    
    return group;
  };
  
  const createChevronMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const stripeWidth = height * 0.1;
    const stripeThickness = mouldingWidth * 10;
    
    // Create chevron pattern
    for (let i = -4; i <= 4; i++) {
      const y = i * (height / 8);
      
      // Create a "V" shape for each chevron
      const shape = new THREE.Shape();
      shape.moveTo(-width/2, y - stripeWidth/2);
      shape.lineTo(0, y);
      shape.lineTo(width/2, y - stripeWidth/2);
      shape.lineTo(width/2, y + stripeWidth/2);
      shape.lineTo(0, y + stripeWidth);
      shape.lineTo(-width/2, y + stripeWidth/2);
      shape.lineTo(-width/2, y - stripeWidth/2);
      
      const geometry = new THREE.ShapeGeometry(shape);
      const mesh = new THREE.Mesh(geometry, material);
      group.add(mesh);
    }
    
    return group;
  };
  
  const createHerringboneMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const pieceLength = Math.min(width, height) * 0.2;
    const pieceWidth = pieceLength * 0.2;
    const pieces = 20; // Number of pieces in pattern
    
    // Create herringbone pattern
    for (let i = -3; i <= 3; i++) {
      for (let j = -5; j <= 5; j++) {
        const x = (j * pieceLength * 0.7);
        const y = (i * pieceLength * 0.7);
        
        // Alternating direction
        const rotation = (i + j) % 2 === 0 ? Math.PI/4 : -Math.PI/4;
        
        const geometry = new THREE.BoxGeometry(pieceLength, pieceWidth, 0.05);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, 0);
        mesh.rotation.z = rotation;
        group.add(mesh);
      }
    }
    
    return group;
  };
  
  const createCofferedMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const lineThickness = Math.max(width, height) * mouldingWidth * 0.5;
    const depthOffset = 0.05; // For 3D effect
    
    // Create a grid like pattern with depth
    // Base layer - grid
    const gridGroup = createGridMoulding(width, height, mouldingWidth, material);
    group.add(gridGroup);
    
    // Add raised panels behind the grid
    const panelWidth = width / 3;
    const panelHeight = height / 3;
    const panelDepth = 0.02;
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const x = (col * panelWidth) - width/2 + panelWidth/2;
        const y = (row * panelHeight) - height/2 + panelHeight/2;
        
        // Inner panel with slight offset
        const panelGeometry = new THREE.BoxGeometry(
          panelWidth - lineThickness * 1.5, 
          panelHeight - lineThickness * 1.5, 
          panelDepth
        );
        const panel = new THREE.Mesh(panelGeometry, material);
        panel.position.set(x, y, -depthOffset);
        group.add(panel);
      }
    }
    
    return group;
  };
  
  const createWainscotingMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const wainscotHeight = height * 0.4; // 40% of wall height
    
    // Base panel covering bottom portion
    const baseGeometry = new THREE.BoxGeometry(width, wainscotHeight, 0.02);
    const baseMaterial = material.clone();
    baseMaterial.color.setHex(0xffffff); // Make base slightly lighter
    const basePanel = new THREE.Mesh(baseGeometry, baseMaterial);
    basePanel.position.set(0, -height/2 + wainscotHeight/2, -0.01);
    group.add(basePanel);
    
    // Top rail
    const railHeight = height * mouldingWidth * 1.2;
    const topRailGeometry = new THREE.BoxGeometry(width, railHeight, 0.05);
    const topRail = new THREE.Mesh(topRailGeometry, material);
    topRail.position.set(0, -height/2 + wainscotHeight, 0);
    group.add(topRail);
    
    // Bottom rail
    const bottomRailGeometry = new THREE.BoxGeometry(width, railHeight, 0.05);
    const bottomRail = new THREE.Mesh(bottomRailGeometry, material);
    bottomRail.position.set(0, -height/2, 0);
    group.add(bottomRail);
    
    // Vertical stiles
    const numPanels = 4; // Number of panels across
    const stileWidth = width * mouldingWidth * 0.8;
    
    for (let i = 0; i <= numPanels; i++) {
      const x = (width * i / numPanels) - width/2;
      
      const stileGeometry = new THREE.BoxGeometry(stileWidth, wainscotHeight, 0.05);
      const stile = new THREE.Mesh(stileGeometry, material);
      stile.position.set(x, -height/2 + wainscotHeight/2, 0);
      group.add(stile);
    }
    
    // Panel moldings (creating frames)
    const panelWidth = width / numPanels;
    const panelFrameWidth = panelWidth * 0.85;
    const panelFrameHeight = wainscotHeight * 0.7;
    
    for (let i = 0; i < numPanels; i++) {
      const x = (i * panelWidth) - width/2 + panelWidth/2;
      const y = -height/2 + wainscotHeight/2;
      
      // Create a rectangular frame for each panel
      const frameShape = new THREE.Shape();
      frameShape.moveTo(-panelFrameWidth/2, -panelFrameHeight/2);
      frameShape.lineTo(panelFrameWidth/2, -panelFrameHeight/2);
      frameShape.lineTo(panelFrameWidth/2, panelFrameHeight/2);
      frameShape.lineTo(-panelFrameWidth/2, panelFrameHeight/2);
      frameShape.lineTo(-panelFrameWidth/2, -panelFrameHeight/2);
      
      // Inner cutout
      const innerWidth = panelFrameWidth - stileWidth;
      const innerHeight = panelFrameHeight - railHeight;
      const hole = new THREE.Path();
      hole.moveTo(-innerWidth/2, -innerHeight/2);
      hole.lineTo(innerWidth/2, -innerHeight/2);
      hole.lineTo(innerWidth/2, innerHeight/2);
      hole.lineTo(-innerWidth/2, innerHeight/2);
      hole.lineTo(-innerWidth/2, -innerHeight/2);
      frameShape.holes.push(hole);
      
      const frameGeometry = new THREE.ShapeGeometry(frameShape);
      const frame = new THREE.Mesh(frameGeometry, material);
      frame.position.set(x, y, 0.01);
      group.add(frame);
    }
    
    return group;
  };
  
  const createShiplapMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const boardHeight = 6 * mouldingWidth * 10; // 6 inches standard
    const gapHeight = 0.1; // Small gap between boards
    const boards = Math.ceil(height / (boardHeight + gapHeight));
    
    for (let i = 0; i < boards; i++) {
      const y = (i * (boardHeight + gapHeight)) - height/2 + boardHeight/2;
      
      // Create each shiplap board
      const boardGeometry = new THREE.BoxGeometry(width, boardHeight, 0.05);
      const board = new THREE.Mesh(boardGeometry, material);
      board.position.set(0, y, 0);
      
      // Add some random variation in depth to simulate real boards
      const depthVariation = (Math.random() - 0.5) * 0.02;
      board.position.z += depthVariation;
      
      group.add(board);
    }
    
    return group;
  };
  
  const createDiagonalCrossMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const thickness = width * mouldingWidth * 1.2;
    
    // Create X pattern with wider boards
    // First diagonal (bottom-left to top-right)
    const diag1Geometry = new THREE.BoxGeometry(
      Math.sqrt(width * width + height * height), // Length of the diagonal
      thickness,
      0.05
    );
    const diag1 = new THREE.Mesh(diag1Geometry, material);
    diag1.rotation.z = Math.atan2(height, width);
    group.add(diag1);
    
    // Second diagonal (top-left to bottom-right)
    const diag2Geometry = new THREE.BoxGeometry(
      Math.sqrt(width * width + height * height), // Length of the diagonal
      thickness,
      0.05
    );
    const diag2 = new THREE.Mesh(diag2Geometry, material);
    diag2.rotation.z = -Math.atan2(height, width);
    group.add(diag2);
    
    // Add horizontal lines
    const hBarCount = 3;
    for (let i = 1; i <= hBarCount; i++) {
      const y = (height * i / (hBarCount + 1)) - height/2;
      
      const barGeometry = new THREE.BoxGeometry(width, thickness * 0.8, 0.05);
      const bar = new THREE.Mesh(barGeometry, material);
      bar.position.set(0, y, 0.01);
      group.add(bar);
    }
    
    // Add vertical lines
    const vBarCount = 2;
    for (let i = 1; i <= vBarCount; i++) {
      const x = (width * i / (vBarCount + 1)) - width/2;
      
      const barGeometry = new THREE.BoxGeometry(thickness * 0.8, height, 0.05);
      const bar = new THREE.Mesh(barGeometry, material);
      bar.position.set(x, 0, 0.01);
      group.add(bar);
    }
    
    return group;
  };
  
  const createVerticalSlatMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const slatCount = 40; // Number of slats
    const slatWidth = width / slatCount;
    const slatGap = slatWidth * 0.2; // 20% of slat width is gap
    const slatDepth = 0.1;
    
    for (let i = 0; i < slatCount; i++) {
      const x = (i * (slatWidth + slatGap)) - width/2 + slatWidth/2;
      
      const slatGeometry = new THREE.BoxGeometry(slatWidth, height, slatDepth);
      const slat = new THREE.Mesh(slatGeometry, material);
      slat.position.set(x, 0, 0);
      group.add(slat);
    }
    
    return group;
  };
  
  const createGeometricSquaresMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    const gridSize = 6; // 6x6 grid
    const cellWidth = width / gridSize;
    const cellHeight = height / gridSize;
    const lineThickness = Math.min(cellWidth, cellHeight) * mouldingWidth * 1.5;
    
    // Create square pattern
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const x = (col * cellWidth) - width/2 + cellWidth/2;
        const y = (row * cellHeight) - height/2 + cellHeight/2;
        
        // Create the frame for each square
        const frameShape = new THREE.Shape();
        frameShape.moveTo(-cellWidth/2, -cellHeight/2);
        frameShape.lineTo(cellWidth/2, -cellHeight/2);
        frameShape.lineTo(cellWidth/2, cellHeight/2);
        frameShape.lineTo(-cellWidth/2, cellHeight/2);
        frameShape.lineTo(-cellWidth/2, -cellHeight/2);
        
        // Create inner cutout
        const innerWidth = cellWidth - lineThickness * 2;
        const innerHeight = cellHeight - lineThickness * 2;
        
        if (innerWidth > 0 && innerHeight > 0) {
          const hole = new THREE.Path();
          hole.moveTo(-innerWidth/2, -innerHeight/2);
          hole.lineTo(innerWidth/2, -innerHeight/2);
          hole.lineTo(innerWidth/2, innerHeight/2);
          hole.lineTo(-innerWidth/2, innerHeight/2);
          hole.lineTo(-innerWidth/2, -innerHeight/2);
          frameShape.holes.push(hole);
        }
        
        const frameGeometry = new THREE.ShapeGeometry(frameShape);
        const frame = new THREE.Mesh(frameGeometry, material);
        frame.position.set(x, y, 0);
        group.add(frame);
      }
    }
    
    return group;
  };
  
  const createRectangularMoulding = (width, height, mouldingWidth, material) => {
    const group = new THREE.Group();
    
    // Create multiple rectangular frames, getting smaller toward center
    const steps = 3;
    for (let i = 0; i < steps; i++) {
      const scaleFactor = 1 - (i * 0.2);
      const frameWidth = width * scaleFactor;
      const frameHeight = height * scaleFactor;
      const borderWidth = width * mouldingWidth;
      
      const frame = createClassicMoulding(frameWidth, frameHeight, mouldingWidth, material);
      group.add(frame);
    }
    
    return group;
  };

  // Helper function to position camera for PDF export
  const setCameraView = (mode) => {
    if (!cameraRef.current || !rendererRef.current || !sceneRef.current) return;
    
    const camera = cameraRef.current;
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    
    setViewMode(mode);
    
    switch (mode) {
      case 'front':
        // Directly facing the accent wall
        camera.position.set(0, 0, 15);
        camera.lookAt(0, 0, -5);
        break;
      case 'top':
        // Top-down view
        camera.position.set(0, 15, 0);
        camera.lookAt(0, 0, -5);
        break;
      case 'corner':
        // Corner view - good for showing the 3D effect
        camera.position.set(10, 5, 10);
        camera.lookAt(0, 0, -5);
        break;
      default:
        // Default view
        const roomWidth = config.width;
        const roomHeight = config.height;
        const roomDepth = 10;
        const distanceFactor = Math.max(1, roomWidth / 10);
        camera.position.set(roomWidth * 0.8, roomHeight * 0.6, roomDepth * 0.8);
        camera.lookAt(0, 0, -roomDepth / 3);
    }
    
    // Force a render to update the view
    renderer.render(scene, camera);
  };
  
  return (
    <div className="relative bg-gray-100 rounded-lg shadow-md p-4 h-[500px]" id="room-visualizer-container">
      <div className="relative h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70 z-10">
            <div className="text-gray-700">Loading 3D View...</div>
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full rounded border border-gray-300"
          id="threejs-canvas"
        />
        <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded text-sm">
          {config.width} ft × {config.height} ft
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-2">
          <button
            onClick={() => setCameraView('front')}
            className={`bg-white/80 p-2 rounded text-sm ${viewMode === 'front' ? 'bg-blue-200' : ''}`}
            title="Front View - Good for PDF export"
          >
            📸 Front
          </button>
          <button
            onClick={() => setCameraView('corner')}
            className={`bg-white/80 p-2 rounded text-sm ${viewMode === 'corner' ? 'bg-blue-200' : ''}`}
            title="Corner View"
          >
            📐 Corner
          </button>
          <button
            onClick={() => setCameraView('default')}
            className={`bg-white/80 p-2 rounded text-sm ${viewMode === 'default' ? 'bg-blue-200' : ''}`}
            title="Default View"
          >
            🔄 Reset
          </button>
        </div>
      </div>
    </div>
  );
} 