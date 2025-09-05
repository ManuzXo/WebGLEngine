import ShaderManager from "./ShaderManager";

export default class ShaderGameObject {
    shaderManager: ShaderManager;
    shaderProgram: WebGLProgram;
    // -- VERTEX SHADER --
    aPosition: number;
    aColor: number;
    aTexCoord: number;

    uModelMatrix: WebGLUniformLocation;
    uViewMatrix: WebGLUniformLocation;
    uProjectionMatrix: WebGLUniformLocation;
    
    // -- FRAG SHADER --
    uGlobalColor: WebGLUniformLocation;
    uTexture: WebGLUniformLocation;
    uUseTexture: WebGLUniformLocation;
    constructor() {
        this.shaderManager = new ShaderManager(Entitys.gl);
        this.shaderProgram = this.shaderManager.buildShaderProgram("gameobject-vertex-shader", "gameobject-fragment-shader");

        this.aPosition = Entitys.gl.getAttribLocation(this.shaderProgram, "aPosition");
        this.aColor = Entitys.gl.getAttribLocation(this.shaderProgram, "aColor");
        this.aTexCoord = Entitys.gl.getAttribLocation(this.shaderProgram, "aTexCoord");

        this.uModelMatrix = Entitys.gl.getUniformLocation(this.shaderProgram, "uModelMatrix") as WebGLUniformLocation;
        this.uViewMatrix = Entitys.gl.getUniformLocation(this.shaderProgram, "uViewMatrix") as WebGLUniformLocation;
        this.uProjectionMatrix = Entitys.gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix") as WebGLUniformLocation;
        
        this.uGlobalColor = Entitys.gl.getUniformLocation(this.shaderProgram, "uGlobalColor") as WebGLUniformLocation;
        this.uTexture = Entitys.gl.getUniformLocation(this.shaderProgram, "uTexture") as WebGLUniformLocation;
        this.uUseTexture = Entitys.gl.getUniformLocation(this.shaderProgram, "uUseTexture") as WebGLUniformLocation;
    }
}