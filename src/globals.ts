// globals.ts
import GameObject from "./components/objects/GameObject";
import ShaderGameObject from "./components/objects/shader/ShaderGameObject";

export { };

declare global {
  var Entitys: {
    canvas: HTMLCanvasElement;
    gl: WebGLRenderingContext;
    shaderGameObject: ShaderGameObject;
    GameObjects: GameObject[];
  };
}

// inizializzazione reale
if (!globalThis.Entitys) {
  globalThis.Entitys = {
    canvas: null as any,
    gl: null as any,
    shaderGameObject: null as any,
    GameObjects: []
  };
}
