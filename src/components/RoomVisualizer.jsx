'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { loadTexture, applyTexture, applyLighting } from '@/lib/textureUtils';
import { PLACEHOLDER_TEXTURES } from '@/lib/textureConstants';

export default function RoomVisualizer({ config }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const [texturesLoaded, setTexturesLoaded] = useState(false);
  const [textures, setTextures] = useState({});
  
  // Setup Three.js scene
  useEffect(() => {
    // Load textures
    const loadTextures = async () => {
      try {
        // Load all required textures
        const wallTexture = await new THREE.TextureLoader().loadAsync(PLACEHOLDER_TEXTURES['plain-wall']);
        const mouldingTexture = await new THREE.TextureLoader().loadAsync(PLACEHOLDER_TEXTURES['white-painted']);
        const floorTexture = await new THREE.TextureLoader().loadAsync(PLACEHOLDER_TEXTURES['wood-floor']);
        
        // Configure texture properties
        [wallTexture, mouldingTexture, floorTexture].forEach(texture => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
        });
        
        // Set repeating patterns for textures
        wallTexture.repeat.set(3, 3);
        mouldingTexture.repeat.set(4, 4);
        floorTexture.repeat.set(5, 5);
        
        setTextures({
          wall: wallTexture,
          moulding: mouldingTexture,
          floor: floorTexture
        });
        
        setTexturesLoaded(true);
      } catch (error) {
        console.error('Error loading textures:', error);
        // Continue with default colors as fallback
        setTexturesLoaded(true);
      }
    };
    
    loadTextures();
    
    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: canvasRef.current,
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Set renderer size
    const canvasContainer = canvasRef.current.parentElement;
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer;
    
    // Setup camera
    const aspectRatio = canvasContainer.clientWidth / canvasContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 1000);
    camera.position.set(0, 6, 10);
    cameraRef.current = camera;
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 15;
    controls.maxPolarAngle = Math.PI / 2;
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light (sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Add point light (interior light)
    const pointLight = new THREE.PointLight(0xfff5e0, 0.7, 20);
    pointLight.position.set(0, 7, 0);
    pointLight.castShadow = true;
    scene.add(pointLight);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    
    // Handle resize
    const handleResize = () => {
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
      renderer.dispose();
      
      // Dispose of all materials and geometries
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          
          if (object.material.map) {
            object.material.map.dispose();
          }
          object.material.dispose();
        }
      });
    };
  }, []);
  
  // Update room based on config changes
  useEffect(() => {
    if (!sceneRef.current || !texturesLoaded) return;
    
    const scene = sceneRef.current;
    
    // Clear existing room objects
    scene.children = scene.children.filter(
      child => !(child instanceof THREE.Mesh)
    );
    
    // Add lights back
    if (scene.children.length === 0) {
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(5, 10, 7);
      directionalLight.castShadow = true;
      scene.add(directionalLight);
      
      const pointLight = new THREE.PointLight(0xfff5e0, 0.7, 20);
      pointLight.position.set(0, 7, 0);
      pointLight.castShadow = true;
      scene.add(pointLight);
    }
    
    // Room dimensions (scaled down from feet to units)
    const roomWidth = config.width / 2;
    const roomHeight = config.height / 2;
    const roomDepth = 10; // Fixed room depth for now
    const wallThickness = 0.2;
    
    // Create floor
    const floorGeometry = new THREE.BoxGeometry(roomWidth, 0.2, roomDepth);
    
    let floorMaterial;
    if (textures.floor) {
      floorMaterial = new THREE.MeshStandardMaterial({
        map: textures.floor,
        roughness: 0.8,
        metalness: 0.2
      });
    } else {
      floorMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Fallback brown color
        roughness: 0.8,
        metalness: 0.2
      });
    }
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -roomHeight / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Create back wall (accent wall)
    const backWallGeometry = new THREE.BoxGeometry(roomWidth, roomHeight, wallThickness);
    
    // Create a canvas for the moulding pattern
    const backWallCanvas = document.createElement('canvas');
    const backWallCtx = backWallCanvas.getContext('2d');
    
    // Set canvas size
    backWallCanvas.width = 1024;
    backWallCanvas.height = 1024;
    
    // Fill with wall color
    backWallCtx.fillStyle = config.color;
    backWallCtx.fillRect(0, 0, backWallCanvas.width, backWallCanvas.height);
    
    // Apply wall texture if available
    if (textures.wall) {
      applyTexture(backWallCtx, textures.wall.image, 0, 0, backWallCanvas.width, backWallCanvas.height, {
        scale: 0.5,
        tint: config.color,
        opacity: 0.9
      });
    }
    
    // Draw moulding pattern on the canvas
    if (config.mouldingType) {
      drawMouldingPatternForTexture(
        backWallCtx,
        backWallCanvas.width,
        backWallCanvas.height,
        config,
        textures.moulding?.image
      );
    }
    
    // Apply lighting effect
    applyLighting(backWallCtx, 0, 0, backWallCanvas.width, backWallCanvas.height, {
      lightDirection: 'top-left',
      intensity: 0.2,
      ambientLight: 0.8
    });
    
    // Create texture from canvas
    const backWallTexture = new THREE.CanvasTexture(backWallCanvas);
    
    const backWallMaterial = new THREE.MeshStandardMaterial({
      map: backWallTexture,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
    backWall.position.z = -roomDepth / 2;
    backWall.receiveShadow = true;
    scene.add(backWall);
    
    // Create side walls with basic color
    const sideWallGeometry = new THREE.BoxGeometry(wallThickness, roomHeight, roomDepth);
    
    // Create side wall material with texture
    let sideWallMaterial;
    if (textures.wall) {
      // Create a canvas for side wall texture
      const sideWallCanvas = document.createElement('canvas');
      const sideWallCtx = sideWallCanvas.getContext('2d');
      
      // Set canvas size
      sideWallCanvas.width = 1024;
      sideWallCanvas.height = 1024;
      
      // Fill with white color
      sideWallCtx.fillStyle = '#ffffff';
      sideWallCtx.fillRect(0, 0, sideWallCanvas.width, sideWallCanvas.height);
      
      // Apply wall texture
      applyTexture(sideWallCtx, textures.wall.image, 0, 0, sideWallCanvas.width, sideWallCanvas.height, {
        scale: 0.5,
        tint: '#ffffff',
        opacity: 0.9
      });
      
      // Apply lighting effect
      applyLighting(sideWallCtx, 0, 0, sideWallCanvas.width, sideWallCanvas.height, {
        lightDirection: 'top',
        intensity: 0.2,
        ambientLight: 0.8
      });
      
      // Create texture from canvas
      const sideWallTexture = new THREE.CanvasTexture(sideWallCanvas);
      
      sideWallMaterial = new THREE.MeshStandardMaterial({
        map: sideWallTexture,
        roughness: 0.7,
        metalness: 0.1
      });
    } else {
      sideWallMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.7,
        metalness: 0.1
      });
    }
    
    const leftWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
    leftWall.position.x = -roomWidth / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);
    
    const rightWall = new THREE.Mesh(sideWallGeometry, sideWallMaterial);
    rightWall.position.x = roomWidth / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);
    
    // Add furniture elements for realism
    addFurniture(scene, roomWidth, roomHeight, roomDepth);
    
    // Update camera position
    cameraRef.current.position.set(0, roomHeight / 2, roomDepth / 2 + 5);
    cameraRef.current.lookAt(0, roomHeight / 2, 0);
    
  }, [config, texturesLoaded, textures]);
  
  return (
    <div className="bg-gray-100 rounded-lg shadow-md p-4 h-[500px]">
      <div className="relative h-full">
        {!texturesLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-70 z-10">
            <div className="text-gray-700">Loading textures...</div>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full rounded border border-gray-300" />
        <div className="absolute bottom-4 left-4 bg-white/80 p-2 rounded text-sm">
          {config.width} ft × {config.height} ft
        </div>
      </div>
    </div>
  );
}

// Create basic furniture elements for realism
function addFurniture(scene, roomWidth, roomHeight, roomDepth) {
  // Add a table
  const tableGeometry = new THREE.BoxGeometry(2, 0.1, 1);
  const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.5
  });
  const table = new THREE.Mesh(tableGeometry, tableMaterial);
  table.position.set(0, -roomHeight / 2 + 1, -roomDepth / 2 + 3);
  table.castShadow = true;
  table.receiveShadow = true;
  scene.add(table);
  
  // Add table legs
  const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1);
  const legMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.5
  });
  
  // Position the legs at the corners of the table
  const legPositions = [
    [-0.9, -roomHeight / 2 + 0.5, -roomDepth / 2 + 2.5],
    [0.9, -roomHeight / 2 + 0.5, -roomDepth / 2 + 2.5],
    [-0.9, -roomHeight / 2 + 0.5, -roomDepth / 2 + 3.5],
    [0.9, -roomHeight / 2 + 0.5, -roomDepth / 2 + 3.5]
  ];
  
  legPositions.forEach(position => {
    const leg = new THREE.Mesh(legGeometry, legMaterial);
    leg.position.set(...position);
    leg.castShadow = true;
    leg.receiveShadow = true;
    scene.add(leg);
  });
  
  // Add a plant
  const potGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4);
  const potMaterial = new THREE.MeshStandardMaterial({
    color: 0xcc8866,
    roughness: 0.7
  });
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.position.set(-roomWidth / 2 + 1, -roomHeight / 2 + 0.2, -roomDepth / 2 + 1);
  pot.castShadow = true;
  pot.receiveShadow = true;
  scene.add(pot);
  
  // Add plant leaves (simplified as a sphere)
  const leavesGeometry = new THREE.SphereGeometry(0.3);
  const leavesMaterial = new THREE.MeshStandardMaterial({
    color: 0x228B22,
    roughness: 0.8
  });
  const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
  leaves.position.set(-roomWidth / 2 + 1, -roomHeight / 2 + 0.7, -roomDepth / 2 + 1);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  scene.add(leaves);
}

// Function to draw moulding pattern for texture
function drawMouldingPatternForTexture(ctx, width, height, config, mouldingImg) {
  const mouldingType = config.mouldingType;
  const mouldingPatterns = {
    classic: drawClassicMoulding,
    modern: drawModernMoulding,
    geometric: drawGeometricMoulding,
    minimal: drawMinimalMoulding,
    herringbone: drawHerringboneMoulding,
    paneled: drawPaneledMoulding,
    wainscoting: drawWainscotingMoulding,
    shiplap: drawShiplapMoulding,
  };
  
  // Call the appropriate pattern function
  if (mouldingPatterns[mouldingType]) {
    mouldingPatterns[mouldingType](ctx, width, height, config, mouldingImg);
  } else {
    mouldingPatterns.classic(ctx, width, height, config, mouldingImg);
  }
}

// Implementations of moulding patterns with textures
function drawClassicMoulding(ctx, width, height, config, mouldingImg) {
  const margin = width * 0.1;
  const outerWidth = width - margin * 2;
  const outerHeight = height - margin * 2;
  const innerWidth = width - margin * 3;
  const innerHeight = height - margin * 3;
  
  // Draw outer frame with texture
  ctx.save();
  
  // Create clipping path for the outer frame
  ctx.beginPath();
  ctx.rect(margin, margin, outerWidth, outerHeight);
  ctx.rect(margin * 1.5, margin * 1.5, innerWidth, innerHeight);
  ctx.clip('evenodd'); // 'evenodd' creates a "hole" in the path
  
  // Apply moulding texture to the frame area if image is available
  if (mouldingImg) {
    applyTexture(ctx, mouldingImg, margin, margin, outerWidth, outerHeight, {
      scale: 0.2,
    });
  } else {
    // Fallback to simple drawing
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(margin, margin, outerWidth, outerHeight);
  }
  
  // Add lighting effect to make it look 3D
  applyLighting(ctx, margin, margin, outerWidth, outerHeight, {
    lightDirection: 'top',
    intensity: 0.5
  });
  
  ctx.restore();
}

// Other moulding pattern functions would be implemented similarly
function drawModernMoulding(ctx, width, height, config, mouldingImg) {
  const margin = width * 0.08;
  
  // Draw horizontal lines with textures
  for (let i = 1; i < 4; i++) {
    const y = (height * i) / 4;
    const lineHeight = 10; // Thicker lines for texture
    
    // Create clipping path for the line
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin, y - lineHeight/2, width - margin * 2, lineHeight);
    ctx.clip();
    
    // Apply moulding texture
    if (mouldingImg) {
      applyTexture(ctx, mouldingImg, margin, y - lineHeight/2, width - margin * 2, lineHeight, {
        scale: 0.1,
      });
    } else {
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(margin, y - lineHeight/2, width - margin * 2, lineHeight);
    }
    
    // Add lighting
    applyLighting(ctx, margin, y - lineHeight/2, width - margin * 2, lineHeight, {
      intensity: 0.4
    });
    
    ctx.restore();
  }
  
  // Draw vertical line
  const lineWidth = 10;
  ctx.save();
  ctx.beginPath();
  ctx.rect(width/2 - lineWidth/2, margin, lineWidth, height - margin * 2);
  ctx.clip();
  
  if (mouldingImg) {
    applyTexture(ctx, mouldingImg, width/2 - lineWidth/2, margin, lineWidth, height - margin * 2, {
      scale: 0.1,
    });
  } else {
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(width/2 - lineWidth/2, margin, lineWidth, height - margin * 2);
  }
  
  applyLighting(ctx, width/2 - lineWidth/2, margin, lineWidth, height - margin * 2, {
    intensity: 0.4
  });
  
  ctx.restore();
}

function drawGeometricMoulding(ctx, width, height, config, mouldingImg) {
  const margin = width * 0.1;
  const size = Math.min(width, height) * 0.15;
  
  for (let x = margin; x < width - margin; x += size * 2) {
    for (let y = margin; y < height - margin; y += size * 2) {
      // Create diamond path for clipping
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y + size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size * 2, y + size);
      ctx.lineTo(x + size, y + size * 2);
      ctx.closePath();
      ctx.clip();
      
      // Calculate a rectangle that encompasses the diamond
      const diamondX = x;
      const diamondY = y;
      const diamondWidth = size * 2;
      const diamondHeight = size * 2;
      
      // Apply moulding texture
      if (mouldingImg) {
        applyTexture(ctx, mouldingImg, diamondX, diamondY, diamondWidth, diamondHeight, {
          scale: 0.15
        });
      } else {
        ctx.fillStyle = '#eeeeee';
        ctx.fill();
      }
      
      // Add lighting effect
      applyLighting(ctx, diamondX, diamondY, diamondWidth, diamondHeight, {
        intensity: 0.5
      });
      
      ctx.restore();
    }
  }
}

function drawMinimalMoulding(ctx, width, height, config, mouldingImg) {
  const margin = width * 0.15;
  const frameWidth = width - margin * 2;
  const frameHeight = height - margin * 2;
  
  // Create frame clipping path
  ctx.save();
  
  // Draw a rectangular path for the frame
  ctx.beginPath();
  ctx.rect(margin, margin, frameWidth, frameHeight);
  
  // Create a slightly smaller rectangle for the inner hole
  const innerMargin = 10; // 10px border width
  ctx.rect(margin + innerMargin, margin + innerMargin, 
           frameWidth - innerMargin * 2, frameHeight - innerMargin * 2);
  
  // Use evenodd fill rule to create a "frame" shape
  ctx.clip('evenodd');
  
  // Apply moulding texture to the frame
  if (mouldingImg) {
    applyTexture(ctx, mouldingImg, margin, margin, frameWidth, frameHeight, {
      scale: 0.15
    });
  } else {
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(margin, margin, frameWidth, frameHeight);
  }
  
  // Add lighting effect
  applyLighting(ctx, margin, margin, frameWidth, frameHeight, {
    intensity: 0.4
  });
  
  ctx.restore();
}

function drawHerringboneMoulding(ctx, width, height, config, mouldingImg) {
  // Similar implementation as in WallVisualizer, just simpler for performance
  const margin = width * 0.1;
  
  // Draw outer frame
  ctx.save();
  ctx.beginPath();
  ctx.rect(margin, margin, width - margin * 2, height - margin * 2);
  
  // Create inner rectangle for the hole
  const innerMargin = 5; // 5px border width
  ctx.rect(margin + innerMargin, margin + innerMargin, 
           width - margin * 2 - innerMargin * 2, height - margin * 2 - innerMargin * 2);
  
  // Use evenodd fill rule to create a "frame" shape
  ctx.clip('evenodd');
  
  // Apply moulding texture to the frame
  if (mouldingImg) {
    applyTexture(ctx, mouldingImg, margin, margin, width - margin * 2, height - margin * 2, {
      scale: 0.15
    });
  } else {
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(margin, margin, width - margin * 2, height - margin * 2);
  }
  
  // Add lighting effect
  applyLighting(ctx, margin, margin, width - margin * 2, height - margin * 2, {
    intensity: 0.4
  });
  
  ctx.restore();
  
  // Draw herringbone pattern (simplified for 3D performance)
  const patternSize = width * 0.05;
  const herringboneRows = 5;
  const herringboneCols = 10;
  
  for (let i = 0; i < herringboneRows; i++) {
    for (let j = 0; j < herringboneCols; j++) {
      const x = margin * 1.5 + j * patternSize * 2;
      const y = margin * 1.5 + i * patternSize * 2;
      
      if (x + patternSize * 2 > width - margin * 1.5 || 
          y + patternSize * 2 > height - margin * 1.5) continue;
      
      // Draw simplified herringbone pattern
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, y + patternSize);
      ctx.lineTo(x + patternSize, y);
      ctx.lineTo(x + patternSize * 2, y + patternSize);
      ctx.lineTo(x + patternSize, y + patternSize * 2);
      ctx.closePath();
      
      if (mouldingImg) {
        ctx.save();
        ctx.clip();
        applyTexture(ctx, mouldingImg, x, y, patternSize * 2, patternSize * 2, {
          scale: 0.1
        });
        ctx.restore();
      } else {
        ctx.fillStyle = '#dddddd';
        ctx.fill();
      }
      
      ctx.restore();
    }
  }
}

function drawPaneledMoulding(ctx, width, height, config, mouldingImg) {
  const margin = width * 0.1;
  const cols = 3;
  const rows = 2;
  
  // Calculate panel dimensions
  const availWidth = width - margin * 2;
  const availHeight = height - margin * 2;
  const panelWidth = availWidth / cols;
  const panelHeight = availHeight / rows;
  
  // Draw outer frame
  ctx.save();
  ctx.beginPath();
  ctx.rect(margin, margin, availWidth, availHeight);
  ctx.clip();
  
  if (mouldingImg) {
    applyTexture(ctx, mouldingImg, margin, margin, availWidth, availHeight, {
      scale: 0.15
    });
  } else {
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(margin, margin, availWidth, availHeight);
  }
  
  applyLighting(ctx, margin, margin, availWidth, availHeight, {
    intensity: 0.4
  });
  ctx.restore();
  
  // Draw grid lines
  const lineWidth = 10;
  
  // Draw vertical dividers
  for (let i = 1; i < cols; i++) {
    const x = margin + i * panelWidth - lineWidth/2;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, margin, lineWidth, availHeight);
    ctx.clip();
    
    if (mouldingImg) {
      applyTexture(ctx, mouldingImg, x, margin, lineWidth, availHeight, {
        scale: 0.1
      });
    } else {
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(x, margin, lineWidth, availHeight);
    }
    
    applyLighting(ctx, x, margin, lineWidth, availHeight, {
      intensity: 0.5
    });
    ctx.restore();
  }
  
  // Draw horizontal dividers
  for (let j = 1; j < rows; j++) {
    const y = margin + j * panelHeight - lineWidth/2;
    
    ctx.save();
    ctx.beginPath();
    ctx.rect(margin, y, availWidth, lineWidth);
    ctx.clip();
    
    if (mouldingImg) {
      applyTexture(ctx, mouldingImg, margin, y, availWidth, lineWidth, {
        scale: 0.1
      });
    } else {
      ctx.fillStyle = '#dddddd';
      ctx.fillRect(margin, y, availWidth, lineWidth);
    }
    
    applyLighting(ctx, margin, y, availWidth, lineWidth, {
      intensity: 0.5
    });
    ctx.restore();
  }
}

function drawWainscotingMoulding(ctx, width, height, config, mouldingImg) {
  // Chair rail
  const railHeight = height * 0.4;
  const railWidth = 12;
  
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, railHeight - railWidth/2, width, railWidth);
  ctx.clip();
  
  if (mouldingImg) {
    applyTexture(ctx, mouldingImg, 0, railHeight - railWidth/2, width, railWidth, {
      scale: 0.1
    });
  } else {
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(0, railHeight - railWidth/2, width, railWidth);
  }
  
  applyLighting(ctx, 0, railHeight - railWidth/2, width, railWidth, {
    intensity: 0.5
  });
  ctx.restore();
  
  // Baseboard
  const margin = width * 0.1;
  const baseboardWidth = 15;
  
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, height - baseboardWidth, width, baseboardWidth);
  ctx.clip();
  
  if (mouldingImg) {
    applyTexture(ctx, mouldingImg, 0, height - baseboardWidth, width, baseboardWidth, {
      scale: 0.1
    });
  } else {
    ctx.fillStyle = '#eeeeee';
    ctx.fillRect(0, height - baseboardWidth, width, baseboardWidth);
  }
  
  applyLighting(ctx, 0, height - baseboardWidth, width, baseboardWidth, {
    intensity: 0.5
  });
  ctx.restore();
  
  // Draw simplified panels below the rail
  const panelCount = 4;
  const panelWidth = (width - margin) / panelCount;
  const panelHeight = height - railHeight - margin;
  
  for (let i = 0; i < panelCount; i++) {
    const x = margin / 2 + i * panelWidth;
    const y = railHeight + margin / 2;
    
    // Outer rectangle
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, panelWidth - margin / 2, panelHeight - margin);
    ctx.clip();
    
    if (mouldingImg) {
      applyTexture(ctx, mouldingImg, x, y, panelWidth - margin / 2, panelHeight - margin, {
        scale: 0.15
      });
    } else {
      ctx.fillStyle = '#eeeeee';
      ctx.fillRect(x, y, panelWidth - margin / 2, panelHeight - margin);
    }
    
    applyLighting(ctx, x, y, panelWidth - margin / 2, panelHeight - margin, {
      intensity: 0.4
    });
    ctx.restore();
  }
}

function drawShiplapMoulding(ctx, width, height, config, mouldingImg) {
  const boardCount = 8;
  const boardHeight = height / boardCount;
  
  for (let i = 0; i < boardCount; i++) {
    const y = i * boardHeight;
    
    // Create a slightly different color for alternating boards
    const tint = i % 2 === 0 ? '#f5f5f5' : '#e0e0e0';
    
    // Draw board with texture
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, y, width, boardHeight - 1);
    ctx.clip();
    
    // Apply wood texture
    if (mouldingImg) {
      applyTexture(ctx, mouldingImg, 0, y, width, boardHeight - 1, {
        scale: 0.2,
        tint: tint
      });
    } else {
      ctx.fillStyle = tint;
      ctx.fillRect(0, y, width, boardHeight - 1);
    }
    
    // Add lighting
    applyLighting(ctx, 0, y, width, boardHeight - 1, {
      intensity: 0.3,
      lightDirection: i % 2 === 0 ? 'top' : 'bottom'
    });
    
    ctx.restore();
    
    // Draw shadow line at the bottom of each board
    ctx.beginPath();
    ctx.moveTo(0, y + boardHeight - 1);
    ctx.lineTo(width, y + boardHeight - 1);
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
} 