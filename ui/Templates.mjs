import {computedSignal, create, FjsObservable, ifjs, signal, signalMap, store} from "https://fjs.targoninc.com/f.mjs";
import {save} from "./Utilities.mjs";

export class Templates {
    static controlPanel(generator) {
        const elements = [];
        generator.getControls().forEach(group => elements.push(group));

        const buttonText = computedSignal(store().get("lastGenTime"), time => `(g) Generate (last took ${time}ms)`);
        elements.push(Templates.buttonWithIcon("refresh", buttonText, () => {
            const start = performance.now();
            generator.generateImage();
            store().setSignalValue("lastGenTime", performance.now() - start);
        }));

        elements.push(Templates.buttonWithIcon("file_download", "(s) Download current image", save));

        return create("div")
            .classes("control-panel", "flex-v")
            .children(...elements)
            .build();
    }

    static buttonWithIcon(icon, text, onclick, classes = []) {
        return create("button")
            .classes("flex", ...classes)
            .onclick(onclick)
            .children(
                Templates.icon(icon),
                create("span")
                    .text(text)
                    .build()
            ).build();
    }

    static icon(icon, classes = []) {
        return create("i")
            .classes("material-symbols-outlined", ...classes)
            .text(icon)
            .build();
    }

    static collapsible(text, content) {
        const uniqueId = Math.random().toString(36).substring(7);
        const toggled = signal(false);
        const iconClass = computedSignal(toggled, on => on ? "rot90" : "rot0");
        const gapClass = computedSignal(toggled, v => v ? "gap" : "no-gap");
        let contentElement;
        const setMaxHeight = () => {
            if (toggled.value) {
                contentElement.style.display = "flex";
            } else {
                contentElement.style.display = "none";
            }
        };

        contentElement = create("div")
            .classes("collapsible-content")
            .id(uniqueId)
            .children(content)
            .onclick(() => {
                setTimeout(() => setMaxHeight(), 100);
            })
            .build();

        return create("div")
            .classes("collapsible", "flex-v", gapClass)
            .children(
                create("div")
                    .classes("collapsible-header", "flex", "align-center")
                    .onclick(() => {
                        toggled.value = !toggled.value;
                        setMaxHeight();
                    })
                    .children(
                        Templates.icon("expand_circle_right", [iconClass]),
                        create("span")
                            .classes("collapsible-title")
                            .text(text)
                            .build()
                    ).build(),
                contentElement
            ).build();
    }

    static colorIndicator(h, s, l, title = "") {
        const canvas = create("canvas")
            .classes("color-indicator")
            .title(title)
            .attributes("width", "16", "height", "16")
            .build();
        const ctx = canvas.getContext("2d");
        const render = () => {
            ctx.fillStyle = `hsl(${h.value * 3.6}, ${s.value}%, ${l.value}%)`;
            ctx.fillRect(0, 0, 16, 16);
        }
        h.subscribe(render);
        s.subscribe(render);
        l.subscribe(render);
        render();
        return canvas;
    }

    static checkboxControl(path, val, icon, onchange) {
        const value = val.constructor === FjsObservable ? val : signal(val);
        const name = path.replace(/\./g, "_");

        return create("div")
            .classes("control")
            .onclick(() => {
                value.value = !value.value;
                onchange(value.value);
            })
            .children(
                create("input")
                    .type("checkbox")
                    .checked(value)
                    .name(name)
                    .build(),
                create("label")
                    .classes("flex")
                    .attributes("for", name)
                    .children(
                        Templates.icon(icon),
                        create("span")
                            .text(path)
                            .build()
                    ).build(),
            ).build();
    }

    static textControl(path, val, onchange) {
        const value = val.constructor === FjsObservable ? val : signal(val);

        return create("div")
            .classes("control", "flex")
            .children(
                create("span")
                    .text(path)
                    .build(),
                create("input")
                    .type("text")
                    .value(value)
                    .onchange(e => {
                        value.value = e.target.value;
                        onchange(e.target.value);
                    }).build(),
            ).build();
    }

    static rangeControl(path, val, icon, onchange) {
        if (val.constructor === FjsObservable) {
            throw new Error("Range control can't be used with FjsObservable");
        }
        const value = signal(path.startsWith("hue.") ? val / 3.6 : val);

        return create("div")
            .classes("control")
            .children(
                create("label")
                    .classes("flex")
                    .children(
                        Templates.icon(icon),
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
                                onchange(e);
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
                        ifjs(path.startsWith("transparency."), Templates.colorIndicator(signal(0), signal(0), value, '')),
                    ).build(),
            ).build();
    }

    static rangeIndicator(value, title, strokeColor = "var(--fg)") {
        const svgSize = 50;
        const radius = svgSize / 2;
        const strokeWidth = svgSize * 0.25;
        const circumference = Math.PI * radius * 2;
        const progress = computedSignal(value, val => Math.round(circumference * ((100 - val) / 100)) + "px");
        const padding = 0.125 * svgSize;

        const svg = create("svg")
            .classes("range-indicator")
            .attributes("width", svgSize, "height", svgSize)
            .attributes("viewBox", `-${padding} -${padding} ${svgSize + (padding * 2)} ${svgSize + (padding * 2)}`)
            .styles("transform", `rotate(-90deg)`)
            .children(
                create("circle")
                    .attributes(
                        "r", radius,
                        "cx", svgSize / 2,
                        "cy", svgSize / 2,
                        "stroke", strokeColor,
                        "fill", "transparent",
                        "stroke-width", strokeWidth + "px",
                        "stroke-linecap", "butt",
                        "stroke-dashoffset", progress,
                        "stroke-dasharray", circumference + "px",
                    ).build()
            ).build();
        return create("div")
            .classes("flex", "range-indicator-container")
            .children(
                svg,
                create("span")
                    .classes("control-value")
                    .text(value)
                    .build()
            ).title(title)
            .build();
    }

    static historyPanel(generator) {
        const history = generator.history;
        const activeIndex = generator.activeHistoryIndex;

        return create("div")
            .classes("history-panel")
            .children(
                signalMap(history,
                    create("div")
                        .classes("flex")
                        .styles("width", "max-content"),
                    (item) => {
                        const index = computedSignal(history, list => list.indexOf(item));
                        let element;
                        const activeClass = computedSignal(activeIndex, active => {
                            if (active === index.value && element) {
                                element.scrollIntoView(true);
                            }
                            return index.value === active ? "active" : "_";
                        });

                        element = create("div")
                            .classes("history-item", activeClass)
                            .children(Templates.canvas(item.imageData))
                            .onclick(() => {
                                generator.loadHistoryEntry(index.value);
                            }).build();
                        return element;
                    })
            ).build();
    }

    static canvas(imageData) {
        const canvas = create("canvas")
            .classes("canvas")
            .width("2560")
            .height("1440")
            .build();

        const ctx = canvas.getContext("2d");
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
}