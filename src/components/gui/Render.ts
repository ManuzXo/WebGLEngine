import { mat4 } from "gl-matrix";
import Camera from "../objects/Camera";
import GameObject from "../objects/GameObject";
import ShaderManager from "../objects/shader/ShaderManager";
import ShaderGameObject from "../objects/shader/ShaderGameObject";

export default class Render {
    cameraEntity: Camera;

    constructor() {
        Entitys.canvas = document.getElementById("myCanvas") as HTMLCanvasElement;
        Entitys.gl = Entitys.canvas.getContext("webgl", { antialias: false, depth: true }) as WebGLRenderingContext;
        Entitys.shaderGameObject = new ShaderGameObject();
        
        this.cameraEntity = new Camera();
        this.AdjustResolution();
        console.log("Render Class", this);
    }
    Render() {
        Entitys.gl.viewport(0, 0, Entitys.canvas.width, Entitys.canvas.height);
        Entitys.gl.clearColor(0.5, 0.5, 0.5, .5);
        Entitys.gl.clear(Entitys.gl.COLOR_BUFFER_BIT | Entitys.gl.DEPTH_BUFFER_BIT);

        Entitys.gl.enable(Entitys.gl.DEPTH_TEST);
        Entitys.gl.depthFunc(Entitys.gl.LEQUAL);
        Entitys.gl.useProgram(Entitys.shaderGameObject.shaderProgram);

        // passa matrici globali
        Entitys.gl.uniformMatrix4fv(Entitys.shaderGameObject.uProjectionMatrix, false, this.cameraEntity.projectionMatrix);
        Entitys.gl.uniformMatrix4fv(Entitys.shaderGameObject.uViewMatrix, false, this.cameraEntity.viewMatrix);

        if (Entitys.GameObjects) {
            for (let obj of Entitys.GameObjects) {
                if (obj == undefined) continue;
                obj.Draw();
            }
        }
        requestAnimationFrame(this.Render.bind(this));
    }
    AdjustResolution() {
        const dpr = window.devicePixelRatio || 1;
        Entitys.canvas.width = Entitys.canvas.clientWidth * dpr;
        Entitys.canvas.height = Entitys.canvas.clientHeight * dpr;
        Entitys.gl.viewport(0, 0, Entitys.canvas.width, Entitys.canvas.height);

        mat4.perspective(
            this.cameraEntity.projectionMatrix,
            Math.PI / 4,
            Entitys.canvas.width / Entitys.canvas.height,
            0.1,
            100.0
        );

    }
}