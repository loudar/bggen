export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.waveOffset = 0;
        this.cache = {};
        this.animationActive = false;
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
        this.drawItems(true);
    }

    drawBackground(useCache = false, background) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        let colors = background.colors, type = background.type;
        if (useCache && this.backgroundCache && this.backgroundCache.type) {
            type = this.backgroundCache.type;
            colors = this.backgroundCache.colors;
        } else {
            colors = colors.map(c => {
                c.transparency = 0;
                return c;
            });
        }
        if (!useCache) {
            this.backgroundCache = {
                type, colors
            };
        }
        this.drawRectangle(type, colors, 0, 0, this.width, this.height);
    }

    drawItems(useCache = false, list = [], filter = "none", font = "sans-serif", background, h, s, l, t, hv, sv, lv, tv) {
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

    drawRectangle(type, colors, x, y, width, height, weight) {
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

    fillRectangle(colors, x, y, width, height) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = colors[0].color;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
    }

    strokeRectangle(colors, x, y, width, height, weight) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.strokeStyle = colors[0].color;
        this.ctx.lineWidth = weight;
        this.ctx.strokeRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
    }

    gradientRectangle(colors, x, y, width, height) {
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);

        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i].color);
        }
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
        this.ctx.globalAlpha = 1;
    }

    drawCircle(type, colors, x, y, radius) {
        switch (type) {
            case "fill":
                this.fillCircle(colors, x, y, radius);
                break;
            case "stroke":
                this.strokeCircle(colors, x, y, radius);
                break;
            case "gradient":
                this.gradientCircle(colors, x, y, radius);
                break;
        }
    }

    fillCircle(colors, x, y, radius) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = colors[0].color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    strokeCircle(colors, x, y, radius, weight) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.strokeStyle = colors[0].color;
        this.ctx.lineWidth = weight;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    gradientCircle(colors, x, y, radius) {
        let gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i].color);
        }
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
    }

    drawText(type, text, x, y, size, color, weight, font) {
        switch (type) {
            case "fill":
                this.fillText(text, x, y, size, color, weight, font);
                break;
            case "stroke":
                this.strokeText(text, x, y, size, color, weight, font);
                break;
            case "gradient":
                this.gradientText(text, x, y, size, color, weight, font);
                break;
        }
    }

    fillText(text, x, y, size, color, weight, font) {
        this.ctx.globalAlpha = color.transparency;
        this.ctx.fillStyle = color.color;
        this.ctx.font = `${size}px ${font}`;
        this.ctx.lineWidth = weight;
        this.ctx.fillText(text, x, y);
        this.ctx.globalAlpha = 1;
    }

    strokeText(text, x, y, size, color, weight, font) {
        this.ctx.globalAlpha = color.transparency;
        this.ctx.strokeStyle = color.color;
        this.ctx.font = `${size}px ${font}`;
        this.ctx.lineWidth = weight;
        this.ctx.strokeText(text, x, y);
        this.ctx.globalAlpha = 1;
    }

    gradientText(text, x, y, size, colors, weight, font) {
        const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i].color);
        }
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = gradient;
        this.ctx.font = `${size}px ${font}`;
        this.ctx.lineWidth = weight;
        this.ctx.fillText(text, x, y);
        this.ctx.globalAlpha = 1;
    }

    applyFilter(filter) {
        this.canvas.style.filter = filter;
    }

    drawWave(type, colors, x, y, size, wave, weight) {
        switch (type) {
            case "fill":
                this.fillWave(colors, x, y, size, wave);
                break;
            case "stroke":
                this.strokeWave(colors, x, y, size, wave, weight);
                break;
            case "gradient":
                this.gradientWave(colors, x, y, size, wave);
                break;
        }
    }

    fillWave(colors, x, y, size, wave) {
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

    strokeWave(colors, x, y, size, wave, weight) {
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.strokeStyle = colors[0].color;
        this.ctx.beginPath();
        this.ctx.lineWidth = weight;
        this.ctx.lineCap = "round";
        let currentX = -x - (size * 2) + (this.waveOffset * size * 2);
        let currentY = y;
        switch (wave) {
            case "sine":
                this.ctx.moveTo(currentX, currentY);
                while (currentX < this.width + size) {
                    this.ctx.arcTo(currentX, currentY - size, currentX + size, currentY + size, size / 2);
                    this.ctx.arcTo(currentX + size, currentY + size, currentX + (size * 2), currentY - size, size / 2);
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

    gradientWave(colors, x, y, size, wave) {
        const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i].color);
        }
        this.ctx.globalAlpha = 1 - colors[0].transparency;
        this.ctx.fillStyle = gradient;
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
        return await this.imageDataToBitmap(imageData, this.width * scalingFactor, this.height * scalingFactor);
    }

    async imageDataToBitmap(imageData, width, height) {
        const resizeWidth = width >> 0;
        const resizeHeight = height >> 0;
        return await window.createImageBitmap(imageData, 0, 0, imageData.width, imageData.height, {
            resizeWidth, resizeHeight
        });
    }

    setImageData(imageData) {
        this.ctx.putImageData(imageData, 0, 0);
    }
}