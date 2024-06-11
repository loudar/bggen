import {create, signal} from "https://fjs.targoninc.com/f.mjs";

export class Generator {
    constructor(canvas) {
        this.ctx = canvas.getContext("2d");
        this.width = canvas.width;
        this.height = canvas.height;
        this.settings = {
            "hue.min": 0,
            "hue.max": 360,
            "saturation.min": 0,
            "saturation.max": 100,
            "lightness.min": 0,
            "lightness.max": 100,
            "hueVariation.min": 0,
            "hueVariation.max": 100,
            "saturationVariation.min": 0,
            "saturationVariation.max": 100,
            "lightnessVariation.min": 0,
            "lightnessVariation.max": 100,
            "rectangleCount.min": 1,
            "rectangleCount.max": 25,
            "rectangleWidth.min": 1,
            "rectangleWidth.max": 25,
            "rectangleHeight.min": 1,
            "rectangleHeight.max": 25,
            "circleCount.min": 1,
            "circleCount.max": 25,
            "circleRadius.min": 1,
            "circleRadius.max": 25,
        }
    }

    settingsIcons = {
        "hue.min": "colorize",
        "hue.max": "colorize",
        "saturation.min": "invert_colors",
        "saturation.max": "invert_colors",
        "lightness.min": "wb_sunny",
        "lightness.max": "wb_sunny",
        "hueVariation.min": "colorize",
        "hueVariation.max": "colorize",
        "saturationVariation.min": "invert_colors",
        "saturationVariation.max": "invert_colors",
        "lightnessVariation.min": "wb_sunny",
        "lightnessVariation.max": "wb_sunny",
        "rectangleCount.min": "crop",
        "rectangleCount.max": "crop",
        "rectangleWidth.min": "crop",
        "rectangleWidth.max": "crop",
        "rectangleHeight.min": "crop",
        "rectangleHeight.max": "crop",
        "circleCount.min": "panorama_fish_eye",
        "circleCount.max": "panorama_fish_eye",
        "circleRadius.min": "panorama_fish_eye",
        "circleRadius.max": "panorama_fish_eye",
    }

    getControlProperties() {
        return Object.keys(this.settings).map(path => {
            return this.getControlProperty(path);
        });
    }

    getControlProperty(path) {
        const value = signal(this.settings[path]);

        return create("div")
            .classes("control")
            .children(
                create("label")
                    .classes("flex")
                    .children(
                        create("i")
                            .classes("material-icons")
                            .text(this.settingsIcons[path])
                            .build(),
                        create("span")
                            .text(path)
                            .build()
                    ).build(),
                create("div")
                    .classes("flex")
                    .children(
                        create("input")
                            .type("range")
                            .attributes("min", 0, "max", 100, "step", 1)
                            .value(value)
                            .oninput(e => {
                                const base = Number(e.target.value);
                                let val = base;
                                if (path.startsWith("hue.")) {
                                    val = Math.round(val * 3.6);
                                }
                                this.settings[path] = val;
                                value.value = base;
                            })
                            .build(),
                        create("span")
                            .classes("control-value")
                            .text(value)
                            .build()
                    ).build(),
            ).build();
    }

    generateImage() {
        const h = this.random(this.settings["hue.min"], this.settings["hue.max"]);
        const s = this.random(this.settings["saturation.min"], this.settings["saturation.max"]);
        const l = this.random(this.settings["lightness.min"], this.settings["lightness.max"]);
        const hv = this.random(this.settings["hueVariation.min"], this.settings["hueVariation.max"]);
        const sv = this.random(this.settings["saturationVariation.min"], this.settings["saturationVariation.max"]);
        const lv = this.random(this.settings["lightnessVariation.min"], this.settings["lightnessVariation.max"]);
        const rectangleCount = this.random(this.settings["rectangleCount.min"], this.settings["rectangleCount.max"]);
        const circleCount = this.random(this.settings["circleCount.min"], this.settings["circleCount.max"]);

        this.clearCanvas();
        this.drawBackground(h, s, l, hv, sv, lv);
        console.log("Drawing rectangles");
        let items = [];
        items = items.concat(this.getRectangles(h, s, l, hv, sv, lv, rectangleCount));
        console.log("Drawing circles");
        items = items.concat(this.getCircles(h, s, l, hv, sv, lv, circleCount));
        console.log("Done");
        items = items.sort(() => Math.random() - 0.5);
        this.drawItems(items);
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    randomFromCenter(center, range, min = 0, max = 100) {
        let val = this.random(center - range, center + range);
        if (val < min) {
            val = max - (min - val);
        } else if (val > max) {
            val = min + (val - max);
        }
        return val;
    }

    drawBackground(h, s, l, hv, sv, lv) {
        const type = this.randomOf(["fill", "gradient"]);
        const colors = [];
        colors.push(this.randomColor(h, s, l, hv, sv, lv));
        if (type === "gradient") {
            const colorCount = this.random(2, 5);
            for (let i = 0; i < colorCount; i++) {
                colors.push(this.randomColor(h, s, l, hv, sv, lv));
            }
        }
        this.drawRectangle(type, colors, 0, 0, this.width, this.height);
    }

    getRectangles(h, s, l, hv, sv, lv, count) {
        const rectangles = [];
        for (let i = 0; i < count; i++) {
            const type = this.randomOf(["fill", "stroke", "gradient"]);
            const x = this.random(0, this.width);
            const y = this.random(0, this.height);
            const width = this.random(this.settings["rectangleWidth.min"], this.settings["rectangleWidth.max"]) / 100 * this.width
            const height = this.random(this.settings["rectangleHeight.min"], this.settings["rectangleHeight.max"]) / 100 * this.height;
            const colors = [];
            colors.push(this.randomColor(h, s, l, hv, sv, lv));
            if (type === "gradient") {
                const colorCount = this.random(2, 5);
                for (let j = 0; j < colorCount; j++) {
                    colors.push(this.randomColor(h, s, l, hv, sv, lv));
                }
            }
            rectangles.push({
                shape: "rectangle",
                type, colors, x, y, width, height
            });
        }
        return rectangles;
    }

    drawItems(list) {
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (item.shape === "rectangle") {
                this.drawRectangle(item.type, item.colors, item.x, item.y, item.width, item.height);
            } else if (item.shape === "circle") {
                this.drawCircle(item.type, item.colors, item.x, item.y, item.radius);
            }
        }
    }

    randomColor(h, s, l, hv, sv, lv) {
        const hue = this.randomFromCenter(h, hv / 2, 0, 360);
        const saturation = this.randomFromCenter(s, sv / 2);
        const lightness = this.randomFromCenter(l, lv / 2);
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    randomOf(array) {
        return array[Math.floor(Math.random() * array.length)];
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

    getCircles(h, s, l, hv, sv, lv, circleCount) {
        const circles = [];
        for (let i = 0; i < circleCount; i++) {
            const type = this.randomOf(["fill", "stroke", "gradient"]);
            const x = this.random(0, this.width);
            const y = this.random(0, this.height);
            const radius = this.random(this.settings["circleRadius.min"], this.settings["circleRadius.max"]) / 100 * this.width;
            const colors = [];
            colors.push(this.randomColor(h, s, l, hv, sv, lv));
            if (type === "gradient") {
                const colorCount = this.random(2, 5);
                for (let j = 0; j < colorCount; j++) {
                    colors.push(this.randomColor(h, s, l, hv, sv, lv));
                }
            }
            circles.push({
                shape: "circle",
                type, colors, x, y, radius: radius / 2
            });
        }
        return circles;
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
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius);
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i]);
        }
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
        this.ctx.fill();
    }
}