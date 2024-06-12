import {create, FjsObservable, signal} from "https://fjs.targoninc.com/f.mjs";
import {Templates} from "./Templates.mjs";
import {Renderer} from "./Renderer.mjs";
import {random, randomColor, randomFloat, randomOf, randomString} from "./Random.mjs";

export class Generator {
    constructor(canvas) {
        this.renderer = new Renderer(canvas);
        this.width = canvas.width;
        this.height = canvas.height;
        this.settings = {
            "hue.min": {
                value: 0,
                icon: "colorize",
                group: "color",
            },
            "hue.max": {
                value: 360,
                icon: "colorize",
                group: "color",
            },
            "saturation.min": {
                value: 0,
                icon: "invert_colors",
                group: "color",
            },
            "saturation.max": {
                value: 100,
                icon: "invert_colors",
                group: "color",
            },
            "lightness.min": {
                value: 0,
                icon: "wb_sunny",
                group: "color",
            },
            "lightness.max": {
                value: 100,
                icon: "wb_sunny",
                group: "color",
            },
            "hueVariation.min": {
                value: 0,
                icon: "colorize",
                group: "variation",
            },
            "hueVariation.max": {
                value: 100,
                icon: "colorize",
                group: "variation",
            },
            "saturationVariation.min": {
                value: 0,
                icon: "invert_colors",
                group: "variation",
            },
            "saturationVariation.max": {
                value: 100,
                icon: "invert_colors",
                group: "variation",
            },
            "lightnessVariation.min": {
                value: 0,
                icon: "wb_sunny",
                group: "variation",
            },
            "lightnessVariation.max": {
                value: 100,
                icon: "wb_sunny",
                group: "variation",
            },
            "rectangleCount.min": {
                value: 1,
                icon: "crop_square",
                group: "shapes",
                subgroup: "rectangles",
            },
            "rectangleCount.max": {
                value: 50,
                icon: "crop_square",
                group: "shapes",
                subgroup: "rectangles",
            },
            "rectangleWidth.min": {
                value: 1,
                icon: "crop_square",
                group: "shapes",
                subgroup: "rectangles",
            },
            "rectangleWidth.max": {
                value: 25,
                icon: "crop_square",
                group: "shapes",
                subgroup: "rectangles",
            },
            "rectangleHeight.min": {
                value: 1,
                icon: "crop_square",
                group: "shapes",
                subgroup: "rectangles",
            },
            "rectangleHeight.max": {
                value: 25,
                icon: "crop_square",
                group: "shapes",
                subgroup: "rectangles",
            },
            "circleCount.min": {
                value: 0,
                icon: "panorama_fish_eye",
                group: "shapes",
                subgroup: "circles",
            },
            "circleCount.max": {
                value: 10,
                icon: "panorama_fish_eye",
                group: "shapes",
                subgroup: "circles",
            },
            "circleRadius.min": {
                value: 1,
                icon: "panorama_fish_eye",
                group: "shapes",
                subgroup: "circles",
            },
            "circleRadius.max": {
                value: 25,
                icon: "panorama_fish_eye",
                group: "shapes",
                subgroup: "circles",
            },
            "textCount.min": {
                value: 0,
                icon: "text_fields",
                group: "shapes",
                subgroup: "texts",
            },
            "textCount.max": {
                value: 10,
                icon: "text_fields",
                group: "shapes",
                subgroup: "texts",
            },
            "textSize.min": {
                value: 1,
                icon: "text_fields",
                group: "shapes",
                subgroup: "texts",
            },
            "textSize.max": {
                value: 10,
                icon: "text_fields",
                group: "shapes",
                subgroup: "texts",
            },
            "waveCount.min": {
                value: 0,
                icon: "waves",
                group: "shapes",
                subgroup: "waves",
            },
            "waveCount.max": {
                value: 10,
                icon: "waves",
                group: "shapes",
                subgroup: "waves",
            },
            "waveSize.min": {
                value: 1,
                icon: "waves",
                group: "shapes",
                subgroup: "waves",
            },
            "waveSize.max": {
                value: 10,
                icon: "waves",
                group: "shapes",
                subgroup: "waves",
            },
            "gridCount.min": {
                value: 1,
                icon: "grid_on",
                group: "grid",
            },
            "gridCount.max": {
                value: 10,
                icon: "grid_on",
                group: "grid",
            },
            "gridSize.min": {
                value: 2,
                icon: "grid_on",
                group: "grid",
            },
            "gridSize.max": {
                value: 10,
                icon: "grid_on",
                group: "grid",
            },
            "keepCurrentItems": {
                value: signal(false),
                icon: "save",
                group: "other",
            },
            "keepCurrentColors": {
                value: signal(false),
                icon: "colorize",
                group: "other",
            },
            "applyRandomFilter": {
                value: signal(false),
                icon: "filter_list",
                group: "other",
            },
            "keepCurrentFilter": {
                value: signal(false),
                icon: "filter_list",
                group: "other",
            },
        };
        this.colors = {
            h: signal(0),
            s: signal(0),
            l: signal(0),
            hv: signal(0),
            sv: signal(0),
            lv: signal(0),
        };
        this.currentFilter = "none";
    }

    getControls() {
        const groups = Object.values(this.settings).reduce((acc, setting) => {
            if (setting.group) {
                if (!acc[setting.group]) {
                    acc[setting.group] = [];
                }
                acc[setting.group].push(setting);
            }
            return acc;
        }, {});
        let elements = [];
        const colorGroup = [
            Templates.colorIndicator(this.colors.h, this.colors.s, this.colors.l, "Base color"),
            Templates.rangeIndicator(this.colors.hv, "Hue variation", "red"),
            Templates.rangeIndicator(this.colors.sv, "Saturation variation", "green"),
            Templates.rangeIndicator(this.colors.lv, "Lightness variation", "blue"),
        ];
        elements.push(create("div")
            .classes("flex")
            .children(colorGroup)
            .build());
        for (const group in groups) {
            const hasSubgroups = groups[group].some(setting => setting.subgroup);
            if (hasSubgroups) {
                const subgroups = groups[group].reduce((acc, setting) => {
                    if (setting.subgroup) {
                        if (!acc[setting.subgroup]) {
                            acc[setting.subgroup] = [];
                        }
                        acc[setting.subgroup].push(setting);
                    }
                    return acc;
                }, {});
                const content = Object.keys(subgroups).map(subgroup => {
                    const subgroupContent = subgroups[subgroup].map(setting => {
                        const settingKey = Object.keys(this.settings).find(key => this.settings[key] === setting);
                        return this.getSettingControl(settingKey);
                    });
                    return Templates.collapsible(subgroup, subgroupContent);
                });
                elements.push(Templates.collapsible(group, content));
                continue;
            }

            const content = groups[group].map(setting => {
                const settingKey = Object.keys(this.settings).find(key => this.settings[key] === setting);
                return this.getSettingControl(settingKey);
            });
            elements.push(Templates.collapsible(group, content));
        }
        return elements;
    }

    getSettingControl(path) {
        if (this.getSettingValue(path).constructor === Number) {
            return this.getSettingRangeControl(path);
        } else if (this.getSettingValue(path).constructor === Boolean) {
            return this.getSettingCheckboxControl(path);
        }
    }

    getSettingCheckboxControl(path) {
        return Templates.checkboxControl(path, this.settings[path].value, this.settings[path].icon, (checked) => {
            if (path !== "applyRandomFilter") {
                return;
            }

            if (checked) {
                console.log("Applying filter " + this.currentFilter);
                this.renderer.applyFilter(this.currentFilter);
            } else {
                console.log("Applying filter none");
                this.renderer.applyFilter("none");
            }
            this.renderer.ctx.save();
        });
    }

    getSettingRangeControl(path) {
        return Templates.rangeControl(path, this.settings[path].value, this.settings[path].icon, (e) => {
            let val = Number(e.target.value);
            if (path.startsWith("hue.")) {
                val = Math.round(val * 3.6);
            }
            this.setSettingValue(path, val);
        });
    }

    generateImage() {
        console.log("Generating image");
        let h, s, l, hv, sv, lv;
        if (this.getSettingValue("keepCurrentColors")) {
            console.log("Keeping current colors");
            h = this.colors.h.value;
            s = this.colors.s.value;
            l = this.colors.l.value;
            hv = this.colors.hv.value;
            sv = this.colors.sv.value;
            lv = this.colors.lv.value;
        } else {
            h = random(this.getSettingValue("hue.min"), this.getSettingValue("hue.max"));
            s = random(this.getSettingValue("saturation.min"), this.getSettingValue("saturation.max"));
            l = random(this.getSettingValue("lightness.min"), this.getSettingValue("lightness.max"));
            hv = random(this.getSettingValue("hueVariation.min"), this.getSettingValue("hueVariation.max"));
            sv = random(this.getSettingValue("saturationVariation.min"), this.getSettingValue("saturationVariation.max"));
            lv = random(this.getSettingValue("lightnessVariation.min"), this.getSettingValue("lightnessVariation.max"));
        }

        this.renderer.drawBackground(h, s, l, hv, sv, lv);

        let items = [], grids = [];
        if (this.getSettingValue("keepCurrentItems")) {
            console.log("Keeping current items");
            items = window.currentData.items;
            grids = window.currentData.grids;
            items.forEach(item => {
                if (item.colors) {
                    item.colors = item.colors.map(() => randomColor(h, s, l, hv, sv, lv));
                }
            });
        } else {
            const rectangleCount = random(this.getSettingValue("rectangleCount.min"), this.getSettingValue("rectangleCount.max"));
            const circleCount = random(this.getSettingValue("circleCount.min"), this.getSettingValue("circleCount.max"));
            const textCount = random(this.getSettingValue("textCount.min"), this.getSettingValue("textCount.max"));
            const waveCount = random(this.getSettingValue("waveCount.min"), this.getSettingValue("waveCount.max"));
            const gridCount = random(this.getSettingValue("gridCount.min"), this.getSettingValue("gridCount.max"));
            for (let i = 0; i < gridCount; i++) {
                const x = random(0, this.width);
                const y = random(0, this.height);
                const width = random(this.getSettingValue("gridSize.min"), this.getSettingValue("gridSize.max"));
                const height = random(this.getSettingValue("gridSize.min"), this.getSettingValue("gridSize.max"));
                grids.push({
                    shape: "grid",
                    x, y, width, height, items: []
                });
            }
            items = items.concat(this.getRectangles(h, s, l, hv, sv, lv, rectangleCount, grids));
            items = items.concat(this.getCircles(h, s, l, hv, sv, lv, circleCount, grids));
            items = items.concat(this.getTexts(h, s, l, hv, sv, lv, textCount));
            items = items.concat(this.getSineWaves(h, s, l, hv, sv, lv, waveCount));
            items = items.sort(() => Math.random() - 0.5);
        }
        window.currentData = {
            items,
            grids,
        };
        this.colors.h.value = h;
        this.colors.s.value = s;
        this.colors.l.value = l;
        this.colors.hv.value = hv;
        this.colors.sv.value = sv;
        this.colors.lv.value = lv;
        let filter = "none";
        if (this.getSettingValue("applyRandomFilter")) {
            if (this.getSettingValue("keepCurrentFilter")) {
                filter = this.currentFilter;
            } else {
                filter = this.getCanvasFilter();
                this.currentFilter = filter;
            }
        }
        this.renderer.drawItems(items, filter);
    }

    getRectangles(h, s, l, hv, sv, lv, count, grids) {
        const rectangles = [];
        for (let i = 0; i < count; i++) {
            const type = randomOf(["fill", "stroke", "gradient"]);
            let x = random(0, this.width);
            let y = random(0, this.height);
            let width = random(this.getSettingValue("rectangleWidth.min"), this.getSettingValue("rectangleWidth.max")) / 100 * this.width
            let height = random(this.getSettingValue("rectangleHeight.min"), this.getSettingValue("rectangleHeight.max")) / 100 * this.height;
            const colors = this.getColorsForType(type, h, s, l, hv, sv, lv);

            const isOnGrid = random(0, 1) > 0.5;
            if (isOnGrid) {
                const randomGridWithFreeSpace = grids.find(grid => {
                    return grid.items.length < grid.width * grid.height;
                });
                if (randomGridWithFreeSpace) {
                    const grid = randomGridWithFreeSpace;
                    const isFirst = grid.items.length === 0;
                    if (isFirst) {
                        x = grid.x;
                        y = grid.y;
                        width = random(this.getSettingValue("rectangleWidth.min"), this.getSettingValue("rectangleWidth.max")) / 100 * this.width;
                        height = random(this.getSettingValue("rectangleHeight.min"), this.getSettingValue("rectangleHeight.max")) / 100 * this.height;
                    } else {
                        const row = Math.floor(grid.items.length / grid.width);
                        const column = grid.items.length % grid.width;
                        x = grid.x + column * (grid.items[0].width ?? grid.items[0].size);
                        y = grid.y + row * (grid.items[0].height ?? grid.items[0].size);
                        width = grid.items[grid.items.length - 1].width ?? grid.items[grid.items.length - 1].size;
                        height = grid.items[grid.items.length - 1].height ?? grid.items[grid.items.length - 1].size;
                    }
                    grid.items.push({
                        shape: "rectangle",
                        type, colors, x, y, width, height, size: (width + height) / 2
                    });
                }
            }

            rectangles.push({
                shape: "rectangle",
                type, colors, x, y, width, height
            });
        }
        return rectangles;
    }

    getCircles(h, s, l, hv, sv, lv, circleCount, grids) {
        const circles = [];
        for (let i = 0; i < circleCount; i++) {
            const type = randomOf(["fill", "stroke", "gradient"]);
            let x = random(0, this.width);
            let y = random(0, this.height);
            let radius = random(this.getSettingValue("circleRadius.min"), this.getSettingValue("circleRadius.max")) / 100 * this.width;
            const colors = this.getColorsForType(type, h, s, l, hv, sv, lv);

            const isOnGrid = random(0, 1) > 0.5;
            if (isOnGrid) {
                const randomGridWithFreeSpace = grids.find(grid => {
                    return grid.items.length < grid.width * grid.height;
                });
                if (randomGridWithFreeSpace) {
                    const grid = randomGridWithFreeSpace;
                    const isFirst = grid.items.length === 0;
                    if (isFirst) {
                        x = grid.x;
                        y = grid.y;
                        radius = random(this.getSettingValue("circleRadius.min"), this.getSettingValue("circleRadius.max")) / 100 * this.width;
                    } else {
                        const row = Math.floor(grid.items.length / grid.width);
                        const column = grid.items.length % grid.width;
                        x = grid.x + column * (grid.items[0].radius ?? grid.items[0].size);
                        y = grid.y + row * (grid.items[0].radius ?? grid.items[0].size);
                        radius = grid.items[grid.items.length - 1].radius ?? grid.items[grid.items.length - 1].size;
                    }
                    grid.items.push({
                        shape: "circle",
                        type, colors, x, y, radius: radius / 2, size: radius
                    });
                }
            }

            circles.push({
                shape: "circle",
                type, colors, x, y, radius: radius / 2
            });
        }
        return circles;
    }

    getSettingValue(path) {
        if (this.settings[path].value.constructor === FjsObservable) {
            return this.settings[path].value.value;
        }
        return this.settings[path].value;
    }

    setSettingValue(path, value) {
        if (this.settings[path].value.constructor === FjsObservable) {
            this.settings[path].value.value = value;
        } else {
            this.settings[path].value = value;
        }
    }

    getColorsForType(type, h, s, l, hv, sv, lv) {
        const colors = [];
        colors.push(randomColor(h, s, l, hv, sv, lv));
        if (type === "gradient") {
            const colorCount = random(2, 5);
            for (let i = 0; i < colorCount; i++) {
                colors.push(randomColor(h, s, l, hv, sv, lv));
            }
        }
        return colors;
    }

    getTexts(h, s, l, hv, sv, lv, textCount) {
        const texts = [];
        for (let i = 0; i < textCount; i++) {
            const type = randomOf(["fill", "stroke", "gradient"]);
            const x = random(0, this.width);
            const y = random(0, this.height);
            const size = random(this.getSettingValue("textSize.min"), this.getSettingValue("textSize.max")) / 100 * this.width;
            const colors = this.getColorsForType(type, h, s, l, hv, sv, lv);
            const text = randomString(random(1, 10));
            texts.push({
                shape: "text",
                type, colors, x, y, size, text
            });
        }
        return texts;
    }

    getSineWaves(h, s, l, hv, sv, lv, waveCount) {
        const waves = [];
        for (let i = 0; i < waveCount; i++) {
            const type = "stroke";
            const x = random(0, this.width);
            const y = random(0, this.height);
            const size = random(this.getSettingValue("waveSize.min"), this.getSettingValue("waveSize.max")) / 100 * this.width;
            const colors = this.getColorsForType(type, h, s, l, hv, sv, lv);
            const wave = randomOf(["sine", "triangle", "square"]);
            waves.push({
                shape: "wave",
                type, colors, x, y, size, wave
            });
        }
        return waves;
    }

    getCanvasFilter() {
        const avilableFilters = ["blur", "brightness", "contrast", "grayscale", "hue-rotate", "invert", "opacity", "saturate", "sepia"];
        const filter = randomOf(avilableFilters);
        if (filter === "hue-rotate") {
            return `hue-rotate(${random(0, 360)}deg)`;
        }
        if (filter === "blur") {
            return `blur(${random(0, 10)}px)`;
        }
        return filter + "(" + randomFloat(0, 1) + ")";
    }
}