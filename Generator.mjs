import {computedSignal, create, ifjs, signal} from "https://fjs.targoninc.com/f.mjs";
import {Templates} from "./Templates.mjs";
import {Renderer} from "./Renderer.mjs";
import {random, randomColor, randomOf} from "./Random.mjs";

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
                value: 25,
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
                value: 1,
                icon: "panorama_fish_eye",
                group: "shapes",
                subgroup: "circles",
            },
            "circleCount.max": {
                value: 25,
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
                        return this.getSettingRangeControl(settingKey);
                    });
                    return Templates.collapsible(subgroup, subgroupContent);
                });
                elements.push(Templates.collapsible(group, content));
                continue;
            }

            const content = groups[group].map(setting => {
                const settingKey = Object.keys(this.settings).find(key => this.settings[key] === setting);
                return this.getSettingRangeControl(settingKey);
            });
            elements.push(Templates.collapsible(group, content));
        }
        return elements;
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
        const h = random(this.getSettingValue("hue.min"), this.getSettingValue("hue.max"));
        const s = random(this.getSettingValue("saturation.min"), this.getSettingValue("saturation.max"));
        const l = random(this.getSettingValue("lightness.min"), this.getSettingValue("lightness.max"));
        const hv = random(this.getSettingValue("hueVariation.min"), this.getSettingValue("hueVariation.max"));
        const sv = random(this.getSettingValue("saturationVariation.min"), this.getSettingValue("saturationVariation.max"));
        const lv = random(this.getSettingValue("lightnessVariation.min"), this.getSettingValue("lightnessVariation.max"));
        const rectangleCount = random(this.getSettingValue("rectangleCount.min"), this.getSettingValue("rectangleCount.max"));
        const circleCount = random(this.getSettingValue("circleCount.min"), this.getSettingValue("circleCount.max"));

        console.log("Drawing background");
        this.renderer.drawBackground(h, s, l, hv, sv, lv);
        console.log("Drawing rectangles");
        let items = [];
        items = items.concat(this.getRectangles(h, s, l, hv, sv, lv, rectangleCount));
        console.log("Drawing circles");
        items = items.concat(this.getCircles(h, s, l, hv, sv, lv, circleCount));
        console.log("Done");
        items = items.sort(() => Math.random() - 0.5);
        this.renderer.drawItems(items);
    }

    getRectangles(h, s, l, hv, sv, lv, count) {
        const rectangles = [];
        for (let i = 0; i < count; i++) {
            const type = randomOf(["fill", "stroke", "gradient"]);
            const x = random(0, this.width);
            const y = random(0, this.height);
            const width = random(this.getSettingValue("rectangleWidth.min"), this.getSettingValue("rectangleWidth.max")) / 100 * this.width
            const height = random(this.getSettingValue("rectangleHeight.min"), this.getSettingValue("rectangleHeight.max")) / 100 * this.height;
            const colors = [];
            colors.push(randomColor(h, s, l, hv, sv, lv));
            if (type === "gradient") {
                const colorCount = random(2, 5);
                for (let j = 0; j < colorCount; j++) {
                    colors.push(randomColor(h, s, l, hv, sv, lv));
                }
            }
            rectangles.push({
                shape: "rectangle",
                type, colors, x, y, width, height
            });
        }
        return rectangles;
    }

    getCircles(h, s, l, hv, sv, lv, circleCount) {
        const circles = [];
        for (let i = 0; i < circleCount; i++) {
            const type = randomOf(["fill", "stroke", "gradient"]);
            const x = random(0, this.width);
            const y = random(0, this.height);
            const radius = random(this.getSettingValue("circleRadius.min"), this.getSettingValue("circleRadius.max")) / 100 * this.width;
            const colors = [];
            colors.push(randomColor(h, s, l, hv, sv, lv));
            if (type === "gradient") {
                const colorCount = random(2, 5);
                for (let j = 0; j < colorCount; j++) {
                    colors.push(randomColor(h, s, l, hv, sv, lv));
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
}