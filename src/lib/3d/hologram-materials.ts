import * as THREE from 'three';

/**
 * Specialized Holographic & Sci-Fi FUI Materials
 * Shared across the Digital Twin transparent mode.
 */
export const HOLO_MATERIALS = {
  // Layer 1: Semi-transparent cyan structural surfaces (walls, partitions, columns)
  wall: new THREE.MeshStandardMaterial({
    color: '#0284c7',
    emissive: '#00e5ff',
    emissiveIntensity: 0.22,
    roughness: 0.15,
    metalness: 0.2,
    transparent: true,
    opacity: 0.14,
    depthWrite: false,
  }),

  // Slabs & floor plates: slightly denser deep cyber-blue
  slab: new THREE.MeshStandardMaterial({
    color: '#0369a1',
    emissive: '#0284c7',
    emissiveIntensity: 0.15,
    roughness: 0.2,
    metalness: 0.3,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  }),

  // Stairs: elevated luminescence so steps are immediately identifiable
  stair: new THREE.MeshStandardMaterial({
    color: '#00e5ff',
    emissive: '#00e5ff',
    emissiveIntensity: 0.45,
    roughness: 0.1,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
  }),

  // Columns & structural pillars
  column: new THREE.MeshStandardMaterial({
    color: '#00e5ff',
    emissive: '#00e5ff',
    emissiveIntensity: 0.35,
    roughness: 0.1,
    transparent: true,
    opacity: 0.25,
    depthWrite: false,
  }),

  // Structural ceiling beams
  beam: new THREE.MeshStandardMaterial({
    color: '#00e5ff',
    emissive: '#00e5ff',
    emissiveIntensity: 0.3,
    roughness: 0.1,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  }),

  // Holographic window glass
  window: new THREE.MeshStandardMaterial({
    color: '#38bdf8',
    roughness: 0.05,
    metalness: 0.8,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  }),

  // Window frame & mullion glowing edges
  windowEdge: new THREE.LineBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.8,
  }),

  // Corridor & stair railing glowing lines
  railing: new THREE.LineBasicMaterial({
    color: '#00e5ff',
    transparent: true,
    opacity: 0.85,
  }),

  // Subtle interior door volume
  door: new THREE.MeshBasicMaterial({
    color: '#0284c7',
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  }),

  // Layer 2: Glowing Wireframe / Structural Edges
  edge: new THREE.LineBasicMaterial({
    color: '#00e5ff',
    transparent: true,
    opacity: 0.85,
    linewidth: 1,
  }),

  // Floor boundary perimeter neon ring
  floorEdge: new THREE.LineBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.95,
  }),

  // Stair step edge delineations
  stairEdge: new THREE.LineBasicMaterial({
    color: '#00ffff',
    transparent: true,
    opacity: 0.95,
  }),

  // Room spatial volumes
  roomLine: new THREE.LineBasicMaterial({
    color: '#0284c7',
    transparent: true,
    opacity: 0.5,
  }),

  // Hovered room holographic fill
  roomHover: new THREE.MeshBasicMaterial({
    color: '#00e5ff',
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  }),

  // Selected room holographic fill
  roomSelected: new THREE.MeshBasicMaterial({
    color: '#38bdf8',
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  }),

  // Selection outline box
  selectionOutline: new THREE.LineBasicMaterial({
    color: '#ffffff',
    transparent: true,
    opacity: 0.95,
  }),

  // Ground grid lines
  groundGrid: new THREE.LineBasicMaterial({
    color: '#00f0ff',
    transparent: true,
    opacity: 0.14,
  }),

  // Scanning laser beam
  scanLaser: new THREE.MeshBasicMaterial({
    color: '#00e5ff',
    transparent: true,
    opacity: 0.35,
    side: THREE.DoubleSide,
    depthWrite: false,
  }),

  // Darkened deep space ground materials in transparent mode
  deepGround: new THREE.MeshStandardMaterial({
    color: '#030712',
    roughness: 0.95,
    metalness: 0.1,
  }),

  deepCourtyard: new THREE.MeshStandardMaterial({
    color: '#020617',
    roughness: 0.95,
    metalness: 0.1,
  }),

  deepAsphalt: new THREE.MeshStandardMaterial({
    color: '#090d16',
    roughness: 0.9,
  }),

  deepField: new THREE.MeshStandardMaterial({
    color: '#041724',
    roughness: 0.9,
  }),
} as const;
