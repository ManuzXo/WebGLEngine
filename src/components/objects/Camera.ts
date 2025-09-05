import { mat4, vec3 } from "gl-matrix";

export default class Camera {
  projectionMatrix: mat4;
  viewMatrix: mat4;

  cameraPos: vec3;
  cameraFront: vec3;
  cameraUp: vec3;
  target: vec3;

  yaw: number;
  pitch: number;
  speed: number;
  sensitivity: number;

  constructor() {
    this.cameraPos = vec3.fromValues(0, 0, 5);
    this.target = vec3.fromValues(0, 0, 0);
    this.cameraFront = vec3.fromValues(0, 0, -1);
    this.cameraUp = vec3.fromValues(0, 1, 0);

    this.yaw = -90;
    this.pitch = 0;
    this.speed = 0.15;
    this.sensitivity = 0.3;

    this.projectionMatrix = mat4.create();
    this.viewMatrix = mat4.create();
    mat4.perspective(this.projectionMatrix, Math.PI / 4, Entitys.canvas.width / Entitys.canvas.height, 0.1, 100.0);
    this.updateCamera();

    if (this.isMobile()) {
      this.setupMobileControls();
    } else {
      this.setupPCControls();
    }
  }

  private isMobile(): boolean {
    return /Mobi|Android|iPhone|iPad|iPod|Tablet/i.test(navigator.userAgent);
  }

  // ---------- PC Free Flight (UFO) ----------
  private setupPCControls() {
    const keys: Record<string, boolean> = {};
    document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
    document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

    const requestPointerLock = Entitys.canvas.requestPointerLock || (Entitys.canvas as any).mozRequestPointerLock;
    Entitys.canvas.onclick = () => requestPointerLock.call(Entitys.canvas);

    document.addEventListener("mousemove", e => {
      if (document.pointerLockElement === Entitys.canvas) {
        this.yaw += e.movementX * this.sensitivity;
        this.pitch -= e.movementY * this.sensitivity;
        this.pitch = Math.max(-89, Math.min(89, this.pitch));
        this.updateFreeFront();
      }
    });

    const move = () => {
      const front = vec3.normalize(vec3.create(), this.cameraFront);
      const right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), front, this.cameraUp));

      if (keys["w"]) vec3.scaleAndAdd(this.cameraPos, this.cameraPos, front, this.speed);
      if (keys["s"]) vec3.scaleAndAdd(this.cameraPos, this.cameraPos, front, -this.speed);
      if (keys["a"]) vec3.scaleAndAdd(this.cameraPos, this.cameraPos, right, -this.speed);
      if (keys["d"]) vec3.scaleAndAdd(this.cameraPos, this.cameraPos, right, this.speed);
      if (keys["q"]) vec3.scaleAndAdd(this.cameraPos, this.cameraPos, this.cameraUp, -this.speed);
      if (keys["e"]) vec3.scaleAndAdd(this.cameraPos, this.cameraPos, this.cameraUp, this.speed);

      this.updateCamera();
      requestAnimationFrame(move);
    };
    move();
  }

  private updateFreeFront() {
    const fx = Math.cos(this.radians(this.yaw)) * Math.cos(this.radians(this.pitch));
    const fy = Math.sin(this.radians(this.pitch));
    const fz = Math.sin(this.radians(this.yaw)) * Math.cos(this.radians(this.pitch));
    this.cameraFront = vec3.normalize(vec3.create(), vec3.fromValues(fx, fy, fz));
  }

  // ---------- Mobile Orbit / Pan / Zoom ----------
  private setupMobileControls() {
    document.body.style.overflow = "hidden";

    let lastX = 0, lastY = 0, lastDist = 0;
    let rotating = false, panning = false;

    Entitys.canvas.addEventListener("touchstart", e => {
      if (e.touches.length === 1) {
        rotating = true;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        panning = true;
        lastX = (e.touches[0].clientX + e.touches[1].clientX)/2;
        lastY = (e.touches[0].clientY + e.touches[1].clientY)/2;
        lastDist = this.getTouchDist(e);
      }
    }, { passive: false });

    Entitys.canvas.addEventListener("touchmove", e => {
      e.preventDefault();
      if (rotating && e.touches.length === 1) {
        const dx = e.touches[0].clientX - lastX;
        const dy = e.touches[0].clientY - lastY;
        lastX = e.touches[0].clientX;
        lastY = e.touches[0].clientY;
        this.orbit(dx, dy);
      } else if (panning && e.touches.length === 2) {
        const cx = (e.touches[0].clientX + e.touches[1].clientX)/2;
        const cy = (e.touches[0].clientY + e.touches[1].clientY)/2;
        const dx = cx - lastX;
        const dy = cy - lastY;
        lastX = cx;
        lastY = cy;

        const dist = this.getTouchDist(e);
        const deltaZoom = dist - lastDist;
        lastDist = dist;

        this.pan(dx, dy);
        this.zoom(deltaZoom * 0.01);
      }
    }, { passive: false });

    Entitys.canvas.addEventListener("touchend", () => { rotating = false; panning = false; });
    Entitys.canvas.addEventListener("touchcancel", () => { rotating = false; panning = false; });
  }

  private orbit(dx: number, dy: number) {
    const offset = vec3.subtract(vec3.create(), this.cameraPos, this.target);
    const radius = vec3.length(offset);
    let theta = Math.atan2(offset[2], offset[0]);
    let phi = Math.acos(offset[1]/radius);

    theta -= dx * this.sensitivity * 0.01;
    phi -= dy * this.sensitivity * 0.01;
    phi = Math.max(0.01, Math.min(Math.PI-0.01, phi));

    const x = radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    this.cameraPos = vec3.fromValues(x + this.target[0], y + this.target[1], z + this.target[2]);
    this.updateFrontMobile();
  }

  private pan(dx: number, dy: number) {
    const offset = vec3.subtract(vec3.create(), this.cameraPos, this.target);
    const right = vec3.normalize(vec3.create(), vec3.cross(vec3.create(), offset, this.cameraUp));
    const up = vec3.normalize(vec3.create(), this.cameraUp);

    vec3.scaleAndAdd(this.cameraPos, this.cameraPos, right, -dx*0.01);
    vec3.scaleAndAdd(this.cameraPos, this.cameraPos, up, dy*0.01);
    vec3.scaleAndAdd(this.target, this.target, right, -dx*0.01);
    vec3.scaleAndAdd(this.target, this.target, up, dy*0.01);

    this.updateFrontMobile();
  }

  private zoom(delta: number) {
    const dir = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this.target, this.cameraPos));
    vec3.scaleAndAdd(this.cameraPos, this.cameraPos, dir, delta);
    this.updateFrontMobile();
  }

  private getTouchDist(e: TouchEvent) {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx*dx + dy*dy);
  }

  private updateFrontMobile() {
    this.cameraFront = vec3.normalize(vec3.create(), vec3.subtract(vec3.create(), this.target, this.cameraPos));
    this.updateCamera();
  }

  // ---------- Camera Update ----------
  private updateCamera() {
    mat4.lookAt(this.viewMatrix, this.cameraPos, vec3.add(vec3.create(), this.cameraPos, this.cameraFront), this.cameraUp);
  }

  private radians(deg: number) {
    return deg * Math.PI / 180;
  }
}
