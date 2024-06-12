import {create, ifjs, signal} from "https://fjs.targoninc.com/f.mjs";
import {Templates} from "./Templates.mjs";
import {Renderer} from "./Renderer.mjs";
import {random, randomColor, randomFloat, randomFromCenter, randomOf, randomString, randomWord} from "./Random.mjs";

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
                value: false,
                icon: "save",
                group: "other",
            },
            "keepCurrentColors": {
                value: false,
                icon: "colorize",
                group: "other",
            },
            "applyRandomFilter": {
                value: false,
                icon: "filter_list",
                group: "other",
            },
        }
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
        const setting = this.settings[path];
        if (setting.value.constructor === Number) {
            return this.getSettingRangeControl(path);
        } else if (setting.value.constructor === Boolean) {
            return this.getSettingCheckboxControl(path);
        }
    }

    getSettingCheckboxControl(path) {
        const value = signal(this.settings[path].value);
        return create("div")
            .classes("control")
            .children(
                create("label")
                    .classes("flex")
                    .children(
                        Templates.icon(this.settings[path].icon),
                        create("span")
                            .text(path)
                            .build()
                    ).build(),
                create("div")
                    .classes("flex")
                    .children(
                        create("input")
                            .type("checkbox")
                            .checked(value)
                            .onchange(e => {
                                this.settings[path].value = e.target.checked;
                                value.value = e.target.checked;
                            })
                            .build(),
                        create("span")
                            .classes("control-value")
                            .text(value)
                            .build(),
                    ).build(),
            ).build();
    }

    getSettingRangeControl(path) {
        const value = signal(path.startsWith("hue.") ? this.settings[path].value / 3.6 : this.settings[path].value);
        if (path === "saturation.max") {
            console.log(value.value);
        }

        return create("div")
            .classes("control")
            .children(
                create("label")
                    .classes("flex")
                    .children(
                        Templates.icon(this.settings[path].icon),
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
                                this.settings[path].value = val;
                                value.value = base;
                            })
                            .build(),
                        create("span")
                            .classes("control-value")
                            .text(value)
                            .build(),
                        ifjs(path.startsWith("hue."), Templates.colorIndicator(value, signal(100), signal(50))),
                        ifjs(path.startsWith("saturation."), Templates.colorIndicator(signal(0), value, signal(50))),
                        ifjs(path.startsWith("lightness."), Templates.colorIndicator(signal(0), signal(0), value)),
                    ).build(),
            ).build();
    }

    generateImage() {
        console.log("Generating image");
        let h, s, l, hv, sv, lv;
        if (this.settings["keepCurrentColors"].value) {
            console.log("Keeping current colors");
            h = window.currentData.colors.h;
            s = window.currentData.colors.s;
            l = window.currentData.colors.l;
            hv = window.currentData.colors.hv;
            sv = window.currentData.colors.sv;
            lv = window.currentData.colors.lv;
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
        if (this.settings["keepCurrentItems"].value) {
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
            items = items.sort(() => Math.random() - 0.5);
        }
        window.currentData = {
            items,
            grids,
            colors: { h, s, l, hv, sv, lv }
        };
        let filter = "none";
        if (this.settings["applyRandomFilter"].value) {
            filter = this.getCanvasFilter();
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
        return this.settings[path].value;
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