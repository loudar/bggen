import {random, randomColor, randomOf} from "./Random.mjs";

export class Renderer {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
    }

    drawBackground(h, s, l, hv, sv, lv) {
        this.ctx.clearRect(0, 0, this.width, this.height);
        const type = randomOf(["fill", "gradient"]);
        const colors = [];
        colors.push(randomColor(h, s, l, hv, sv, lv));
        if (type === "gradient") {
            const colorCount = random(2, 5);
            for (let i = 0; i < colorCount; i++) {
                colors.push(randomColor(h, s, l, hv, sv, lv));
            }
        }
        this.drawRectangle(type, colors, 0, 0, this.width, this.height);
    }

    drawItems(list, filter) {
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (item.shape === "rectangle") {
                this.drawRectangle(item.type, item.colors, item.x, item.y, item.width, item.height);
            } else if (item.shape === "circle") {
                this.drawCircle(item.type, item.colors, item.x, item.y, item.radius);
            } else if (item.shape === "text") {
                this.drawText(item.type, item.text, item.x, item.y, item.size, item.colors);
            }
        }
        this.applyFilter(filter);
    }

    drawRectangle(type, colors, x, y, width, height) {
        switch (type) {
            case "fill":
                this.fillRectangle(colors, x, y, width, height);
                break;
            case "stroke":
                this.strokeRectangle(colors, x, y, width, height);
                break;
            case "gradient":
                this.gradientRectangle(colors, x, y, width, height);
                break;
        }
    }

    fillRectangle(colors, x, y, width, height) {
        this.ctx.fillStyle = colors[0];
        this.ctx.fillRect(x, y, width, height);
    }

    strokeRectangle(colors, x, y, width, height) {
        this.ctx.strokeStyle = colors[0];
        this.ctx.strokeRect(x, y, width, height);
    }

    gradientRectangle(colors, x, y, width, height) {
        const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i]);
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x, y, width, height);
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
        this.ctx.fillStyle = colors[0];
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    strokeCircle(colors, x, y, radius) {
        this.ctx.strokeStyle = colors[0];
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.stroke();
    }

    gradientCircle(colors, x, y, radius) {
        let gradient;
        try {
            gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        } catch (e) {
            console.log(e, colors, x, y, radius);
            return;
        }
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i]);
        }
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }

    drawText(type, text, x, y, size, color) {
        switch (type) {
            case "fill":
                this.fillText(text, x, y, size, color);
                break;
            case "stroke":
                this.strokeText(text, x, y, size, color);
                break;
            case "gradient":
                this.gradientText(text, x, y, size, color);
                break;
        }
    }

    fillText(text, x, y, size, color) {
        this.ctx.fillStyle = color;
        this.ctx.font = `${size}px sans-serif`;
        this.ctx.fillText(text, x, y);
    }

    strokeText(text, x, y, size, color) {
        this.ctx.strokeStyle = color;
        this.ctx.font = `${size}px sans-serif`;
        this.ctx.strokeText(text, x, y);
    }

    gradientText(text, x, y, size, colors) {
        const gradient = this.ctx.createLinearGradient(x, y, x + size, y + size);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i]);
        }
        this.ctx.fillStyle = gradient;
        this.ctx.font = `${size}px sans-serif`;
        this.ctx.fillText(text, x, y);
    }

    applyFilter(filter) {
        this.ctx.filter = filter;
    }
}