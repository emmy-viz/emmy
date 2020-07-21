import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Vector } from '../vector';
import { VectorField } from '../vector_field';
export declare class Viz {
    camera: THREE.Camera;
    canvas: HTMLCanvasElement;
    scene: THREE.Scene;
    renderer: THREE.Renderer;
    controls: OrbitControls;
    width: number;
    constructor(canvas: HTMLCanvasElement);
    init(): void;
    drawGrid(): void;
    drawVector(origin: any, v: Vector, color?: number): THREE.ArrowHelper;
    drawVectorField(vf: VectorField, color?: number): void;
    animate(): void;
}
