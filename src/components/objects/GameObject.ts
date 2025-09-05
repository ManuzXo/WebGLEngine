import Mesh from "./Mesh";
import Transform from "./Transform";

export default class GameObject {
    mesh: Mesh;
    transform;
    constructor(mesh: Mesh) {
        this.mesh = mesh;
        this.transform = new Transform();
        console.log("GameObject Class", this);
    }

    Draw() {
        const gl = Entitys.gl;
        this.mesh.BindVertexBuffer(Entitys.shaderGameObject.aPosition);
        this.mesh.BindColorBuffer(Entitys.shaderGameObject.aColor);
        this.mesh.BindIndicesBuffer();

        gl.uniformMatrix4fv(Entitys.shaderGameObject.uModelMatrix, false, this.transform.modelMatrix);
        gl.drawElements(gl.TRIANGLES, this.mesh.indicesData.length, gl.UNSIGNED_SHORT, 0);
    }
}