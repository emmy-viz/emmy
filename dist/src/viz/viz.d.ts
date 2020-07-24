import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector } from '../vector';
import { VectorField } from '../vector_field';
export declare class Visualization {
    camera: THREE.Camera;
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    renderer: THREE.Renderer;
    controls: OrbitControls;
    width: number;
    testPointCount: number;
    testPointE: VectorField;
    constructor(canvas: HTMLCanvasElement);
    init(): void;
    drawGrid(): void;
    drawSphere(origin: Vector, color: number): void;
    drawVector(origin: any, v: Vector, color?: number): THREE.ArrowHelper;
    drawVectorField(vf: VectorField, color?: number, widthScale?: number): void;
    drawTestPoints(E: VectorField): void;
    updateTestPoints(): void;
    animate(): void;
}
export declare class TestPoint {
    life: number;
    mesh: THREE.Mesh;
    constructor(m: THREE.Mesh);
}
