export class Renderer {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    width: number;
    height: number;
    waveOffset: number;
    cache: any;
    backgroundCache: any;
    animationActive: boolean;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        this.width = canvas.width;
        this.height = canvas.height;
        this.waveOffset = 0;
        this.cache = {};
        this.animationActive = false;
    }

    drawBlob(type: string, colors: any[], nodes: { x: number, y: number, radius: number }[]) {
        switch (type) {
            case "fill":
                this.fillBlob(colors, nodes);
                break;
            case "gradient":
                this.gradientBlob(colors, nodes);
                break;
        }
    }

    // Soft metaball-like rendering by additive blending of radial fields
    fillBlob(colors: any[], nodes: { x: number, y: number, radius: number }[]) {
        const originalComp = this.ctx.globalCompositeOperation;
        const originalAlpha = this.ctx.globalAlpha;
        this.ctx.globalCompositeOperation = 'lighter' as any;
        // Attenuate additive blending to avoid overly bright results when nodes overlap
        const attenuation = 0.35;
        this.ctx.globalAlpha = originalAlpha * attenuation;
        // draw each node as a soft radial gradient circle
        for (const n of nodes) {
            const r = n.radius;
            const g = this.ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
            const base = colors[0];
            const alpha = 1 - (base.transparency || 0);
            g.addColorStop(0, this.applyAlphaToColor(base.color, alpha));
            g.addColorStop(1, this.applyAlphaToColor(base.color, 0));
            this.ctx.fillStyle = g as any;
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = originalComp as any;
        this.ctx.globalAlpha = originalAlpha;
    }

    gradientBlob(colors: any[], nodes: { x: number, y: number, radius: number }[]) {
        const originalComp = this.ctx.globalCompositeOperation;
        const originalAlpha = this.ctx.globalAlpha;
        this.ctx.globalCompositeOperation = 'lighter' as any;
        // Attenuate brightness for gradients as well
        const attenuation = 0.35;
        this.ctx.globalAlpha = originalAlpha * attenuation;
        // Use multiple color stops by mapping first two colors as inner/outer; if more, blend proportionally
        for (const n of nodes) {
            const r = n.radius;
            const g = this.ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
            const inner = colors[0];
            const outer = colors[1] ?? colors[0];
            const innerA = 1 - (inner.transparency || 0);
            g.addColorStop(0, this.applyAlphaToColor(inner.color, innerA));
            // optional middle stop if 3rd color exists
            if (colors[2]) {
                const mid = colors[2];
                const midA = 0.2 * (1 - (mid.transparency || 0));
                g.addColorStop(0.5, this.applyAlphaToColor(mid.color, midA));
            }
            g.addColorStop(1, this.applyAlphaToColor(outer.color, 0));
            this.ctx.fillStyle = g as any;
            this.ctx.beginPath();
            this.ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalCompositeOperation = originalComp as any;
        this.ctx.globalAlpha = originalAlpha;
    }

    // Utility: take hsl(...) or rgb(...) color string and apply alpha, returning rgba(...)
    applyAlphaToColor(color: string, alpha: number) {
        // If it's already rgba/hsla use as-is replacing alpha
        if (color.startsWith('rgba(')) {
            const parts = color.slice(5, -1).split(',').map(p => p.trim());
            return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
        if (color.startsWith('hsla(')) {
            const parts = color.slice(5, -1).split(',').map(p => p.trim());
            return `hsla(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
        if (color.startsWith('hsl(')) {
            const inner = color.slice(4, -1);
            return `hsla(${inner}, ${alpha})`;
        }
        if (color.startsWith('rgb(')) {
            const inner = color.slice(4, -1);
            return `rgba(${inner}, ${alpha})`;
        }
        // fallback: assume hex
        try {
            if (color.startsWith('#')) {
                const hex = color.substring(1);
                const bigint = parseInt(hex.length === 3 ? hex.split('').map(h => h + h).join('') : hex, 16);
                const r = (bigint >> 16) & 255;
                const g = (bigint >> 8) & 255;
                const b = bigint & 255;
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        } catch {
        }
        return color;
    }

    getWaveOffset(fps = 30) {
        this.waveOffset += 1 / fps;
        if (this.waveOffset >= 1) {
            this.waveOffset = 0;
        }
        return this.waveOffset;
    }

    animateFrame(fps = 30) {
        if (!this.animationActive) {
            return;
        }
        this.getWaveOffset(fps);
        this.drawItems(true as any);
    }

    drawBackground(useCache = false, background?: any) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        let colors = background.colors, type = background.type;
        if (useCache && (this as any).backgroundCache && (this as any).backgroundCache.type) {
            type = (this as any).backgroundCache.type;
            colors = (this as any).backgroundCache.colors;
        } else {
            colors = colors.map((c: any) => {
                c.transparency = 0;
                return c;
            });
        }
        if (!useCache) {
            (this as any).backgroundCache = {
                type, colors
            };
        }
        this.drawRectangle(type, colors, 0, 0, this.width, this.height);
    }

    drawItems(useCache = false, list: any[] = [], filter = "none", font = "sans-serif", background?: any, h?: any, s?: any, l?: any, t?: any, hv?: any, sv?: any, lv?: any, tv?: any) {
        if (useCache && this.cache.items && this.cache.filter === filter) {
            list = this.cache.items;
            filter = this.cache.filter;
            h = this.cache.h;
            s = this.cache.s;
            l = this.cache.l;
            t = this.cache.t;
            hv = this.cache.hv;
            sv = this.cache.sv;
            lv = this.cache.lv;
            tv = this.cache.tv;
            font = this.cache.font;
            background = this.cache.background;
        }
        this.drawBackground(useCache, background);
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            switch (item.shape) {
                case "rectangle":
                    this.drawRectangle(item.type, item.colors, item.x, item.y, item.width, item.height, item.weight);
                    break;
                case "circle":
                    this.drawCircle(item.type, item.colors, item.x, item.y, item.radius, item.weight);
                    break;
                case "text":
                    this.drawText(item.type, item.text, item.x, item.y, item.size, item.colors, item.weight, font);
                    break;
                case "wave":
                    this.drawWave(item.type, item.colors, item.x, item.y, item.size, item.wave, item.weight);
                    break;
                case "blob":
                    this.drawBlob(item.type, item.colors, item.nodes);
                    break;
            }
        }
        this.applyFilter(filter);
        if (!useCache) {
            this.cache = {
                items: list,
                filter,
                h, s, l, t, hv, sv, lv, tv,
                font,
                background
            };
        }
    }

    drawRectangle(type: string, colors: any[], x: number, y: number, width: number, height: number, weight?: number) {
        switch (type) {
            case "fill":
                this.fillRectangle(colors, x, y, width, height);
                break;
            case "stroke":
                this.strokeRectangle(colors, x, y, width, height, weight);
                break;
            case "gradient":
                this.gradientRectangle(colors, x, y, width, height);
                break;
        }
    }

    fillRectangle(colors: any[], x: number, y: number, width: number, height: number) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = colors[0].color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
    }

    strokeRectangle(colors: any[], x: number, y: number, width: number, height: number, weight = 1) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.strokeStyle = colors[0].color;
        this.ctx.lineWidth = weight;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
    }

    gradientRectangle(colors: any[], x: number, y: number, width: number, height: number) {
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
        gradient.addColorStop(0, colors[0].color);
        gradient.addColorStop(1, colors[1]?.color ?? colors[0].color);
        this.ctx.globalAlpha = 1 - (colors[0].transparency || 0);
        this.ctx.fillStyle = gradient as any;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
    }

    drawCircle(type: string, colors: any[], x: number, y: number, radius: number, weight?: number) {
        switch (type) {
            case "fill":
                this.fillCircle(colors, x, y, radius);
                break;
            case "stroke":
                this.strokeCircle(colors, x, y, radius, weight);
                break;
            case "gradient":
                this.gradientCircle(colors, x, y, radius);
                break;
        }
    }

    fillCircle(colors: any[], x: number, y: number, radius: number) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = colors[0].color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    strokeCircle(colors: any[], x: number, y: number, radius: number, weight = 1) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.strokeStyle = colors[0].color;
        this.ctx.lineWidth = weight;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    gradientCircle(colors: any[], x: number, y: number, radius: number) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, colors[0].color);
        gradient.addColorStop(1, colors[1]?.color ?? colors[0].color);
        this.ctx.globalAlpha = 1 - (colors[0].transparency || 0);
        this.ctx.fillStyle = gradient as any;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawText(type: string, text: string, x: number, y: number, size: number, colors: any[], weight = 1, font = "sans-serif") {
        switch (type) {
            case "fill":
                this.fillText(text, x, y, size, colors, font);
                break;
            case "stroke":
                this.strokeText(text, x, y, size, colors, weight, font);
                break;
            case "gradient":
                this.gradientText(text, x, y, size, colors, font);
                break;
        }
    }

    fillText(text: string, x: number, y: number, size: number, colors: any[], font: string) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = colors[0].color;
        this.ctx.font = `${size}px ${font}`;
        this.ctx.fillText(text, x, y);
        this.ctx.globalAlpha = 1;
    }

    strokeText(text: string, x: number, y: number, size: number, colors: any[], weight: number, font: string) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.strokeStyle = colors[0].color;
        this.ctx.lineWidth = weight;
        this.ctx.font = `${size}px ${font}`;
        this.ctx.strokeText(text, x, y);
        this.ctx.globalAlpha = 1;
    }

    gradientText(text: string, x: number, y: number, size: number, colors: any[], font: string) {
        const metrics = this.ctx.measureText(text);
        const width = metrics.width || size * text.length;
        const gradient = this.ctx.createLinearGradient(x, y - size, x + width, y + size);
        gradient.addColorStop(0, colors[0].color);
        gradient.addColorStop(1, colors[1]?.color ?? colors[0].color);
        this.ctx.globalAlpha = 1 - (colors[0].transparency || 0);
        this.ctx.fillStyle = gradient as any;
        this.ctx.font = `${size}px ${font}`;
        this.ctx.fillText(text, x, y);
        this.ctx.globalAlpha = 1;
    }

    applyFilter(filter: string) {
        // Match previous behavior: CSS filter on canvas element
        (this.canvas.style as any).filter = filter;
    }

    drawWave(type: string, colors: any[], x: number, y: number, size: number, wave: string, weight?: number) {
        switch (type) {
            case "fill":
                this.fillWave(colors, x, y, size, wave);
                break;
            case "stroke":
                this.strokeWave(colors, x, y, size, wave, weight ?? 1);
                break;
            case "gradient":
                this.gradientWave(colors, x, y, size, wave);
                break;
        }
    }

    fillWave(colors: any[], x: number, y: number, size: number, wave: string) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = colors[0].color;
        this.ctx.beginPath();
        switch (wave) {
            case "sine":
                this.ctx.arc(x, y, size, 0, 2 * Math.PI);
                break;
            case "triangle":
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + size, y + size / 2);
                this.ctx.lineTo(x, y + size);
                break;
            case "square":
                this.ctx.rect(x, y, size, size);
                break;
        }
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    strokeWave(colors: any[], x: number, y: number, size: number, wave: string, weight: number) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.strokeStyle = colors[0].color;
        this.ctx.beginPath();
        this.ctx.lineWidth = weight;
        this.ctx.lineCap = "round" as any;
        let currentX = -x - size * 2 + this.waveOffset * size * 2;
        let currentY = y;
        switch (wave) {
            case "sine":
                this.ctx.moveTo(currentX, currentY);
                while (currentX < this.width + size) {
                    this.ctx.arcTo(currentX, currentY - size, currentX + size, currentY + size, size / 2);
                    this.ctx.arcTo(currentX + size, currentY + size, currentX + size * 2, currentY - size, size / 2);
                    currentX += size * 2;
                }
                break;
            case "triangle":
                while (currentX < this.width + size) {
                    this.ctx.moveTo(currentX, currentY);
                    currentX += size;
                    currentY += size;
                    this.ctx.lineTo(currentX, currentY);
                    currentX += size;
                    currentY -= size;
                    this.ctx.lineTo(currentX, currentY);
                }
                break;
            case "square":
                while (currentX < this.width + size) {
                    this.ctx.moveTo(currentX, currentY);
                    this.ctx.lineTo(currentX + size, currentY);
                    currentX += size;
                    this.ctx.moveTo(currentX, currentY);
                    this.ctx.lineTo(currentX, currentY + size);
                    currentY += size;
                    this.ctx.moveTo(currentX, currentY);
                    this.ctx.lineTo(currentX + size, currentY);
                    currentX += size;
                    this.ctx.moveTo(currentX, currentY);
                    this.ctx.lineTo(currentX, currentY - size);
                    currentY -= size;
                }
                break;
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    gradientWave(colors: any[], x: number, y: number, size: number, wave: string) {
        const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i].color);
        }
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = gradient as any;
        this.ctx.beginPath();
        switch (wave) {
            case "sine":
                this.ctx.arc(x, y, size, 0, 2 * Math.PI);
                break;
            case "triangle":
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + size, y + size / 2);
                this.ctx.lineTo(x, y + size);
                break;
            case "square":
                this.ctx.rect(x, y, size, size);
                break;
        }
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    async getBitmap(scalingFactor = 1) {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        return await this.imageDataToBitmap(imageData as any, this.width * scalingFactor, this.height * scalingFactor);
    }

    async imageDataToBitmap(imageData: ImageData, width: number, height: number) {
        const resizeWidth = (width as any) >> 0;
        const resizeHeight = (height as any) >> 0;
        return await (window as any).createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
            resizeWidth, resizeHeight
        });
    }

    setImageData(imageData: ImageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }
}
