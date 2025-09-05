export default class Material {
    private texture: WebGLTexture | null;
    public useTexture: boolean;
    constructor() {
        this.texture = null;
        this.useTexture = false;
    }

    /**
     * Carica una texture da URL (es. PNG, JPG)
     */
    LoadTextureFromUrl(url: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.crossOrigin = "anonymous"; // utile se l'immagine è hostata altrove
            image.onload = () => {
                this.texture = Entitys.gl.createTexture();
                Entitys.gl.bindTexture(Entitys.gl.TEXTURE_2D, this.texture);

                // Carica i pixel della texture
                Entitys.gl.texImage2D(
                    Entitys.gl.TEXTURE_2D,
                    0,
                    Entitys.gl.RGBA,
                    Entitys.gl.RGBA,
                    Entitys.gl.UNSIGNED_BYTE,
                    image
                );
                // Parametri (puoi personalizzarli)
                Entitys.gl.texParameteri(Entitys.gl.TEXTURE_2D, Entitys.gl.TEXTURE_WRAP_S, Entitys.gl.CLAMP_TO_EDGE);
                Entitys.gl.texParameteri(Entitys.gl.TEXTURE_2D, Entitys.gl.TEXTURE_WRAP_T, Entitys.gl.CLAMP_TO_EDGE);
                Entitys.gl.texParameteri(Entitys.gl.TEXTURE_2D, Entitys.gl.TEXTURE_MIN_FILTER, Entitys.gl.LINEAR);
                Entitys.gl.texParameteri(Entitys.gl.TEXTURE_2D, Entitys.gl.TEXTURE_MAG_FILTER, Entitys.gl.LINEAR);
                this.useTexture = true;
                resolve();
            };

            image.onerror = () => reject(new Error("Errore nel caricamento texture da URL: " + url));
            image.src = url;
        });
    }
    /**
     * Applica il materiale (bind della texture + uniform)
     */
    Apply(program: WebGLProgram): void {
        const uUseTexture = Entitys.gl.getUniformLocation(program, "uUseTexture");
        Entitys.gl.uniform1i(uUseTexture, this.useTexture ? 1 : 0);
        if (this.useTexture && this.texture) {
            const uTexture = Entitys.gl.getUniformLocation(program, "uTexture");
            Entitys.gl.activeTexture(Entitys.gl.TEXTURE0);
            Entitys.gl.bindTexture(Entitys.gl.TEXTURE_2D, this.texture);
            Entitys.gl.uniform1i(uTexture, 0); // slot 0
        }
    }
}
