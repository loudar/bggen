import {lastGenTime} from "./main";
import {save} from "./Utilities";
import {compute, create, InputType, isSignal, signal, signalMap, when} from "@targoninc/jess";

export class Templates {
    static controlPanel(generator: any) {
        const elements: any[] = [];
        generator.getControls().forEach((group: any) => elements.push(group));

        const buttonText = compute((time: any) => `(g) Generate (last took ${time}ms)`, lastGenTime);
        elements.push(Templates.buttonWithIcon("refresh", buttonText, () => {
            const start = performance.now();
            generator.generateImage();
            lastGenTime.value = performance.now() - start;
        }));

        elements.push(Templates.buttonWithIcon("file_download", "(s) Download current image", save));

        return create("div")
            .classes("control-panel", "flex-v")
            .children(...elements)
            .build();
    }

    static buttonWithIcon(icon: string, text: any, onclick: () => void, classes: any[] = []) {
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

    static icon(icon: string, classes: any[] = []) {
        return create("i")
            .classes("material-symbols-outlined", ...classes)
            .text(icon)
            .build();
    }

    static collapsible(text: string, content: any) {
        const uniqueId = Math.random().toString(36).substring(7);
        const toggled = signal(false);
        const iconClass = compute((on: boolean) => on ? "rot90" : "rot0", toggled);
        const gapClass = compute((v: boolean) => v ? "gap" : "no-gap", toggled);
        let contentElement: any;
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

    static colorIndicator(h: any, s: any, l: any, title = "") {
        const canvas = create("canvas")
            .classes("color-indicator")
            .title(title)
            .attributes("width", "16", "height", "16")
            .build() as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
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

    static checkboxControl(path: string, val: any, icon: string, onchange: any) {
        const value = isSignal(val) ? val : signal(val);
        const name = path.replace(/\./g, "_");

        return create("div")
            .classes("control")
            .onclick(() => {
                value.value = !value.value;
                onchange?.(value.value);
            })
            .children(
                create("input")
                    .type(InputType.checkbox)
                    .checked(value)
                    .name(name)
                    .build(),
                create("label")
                    .classes("flex")
                    .attributes("for", name)
                    .children(
                        Templates.icon(icon),
                        create("span").text(path).build()
                    ).build()
            ).build();
    }

    static textControl(path: string, val: any, onchange: (v: string) => void) {
        const value = isSignal(val) ? val : signal(val);

        return create("div")
            .classes("control", "flex")
            .children(
                create("span").text(path).build(),
                create("input")
                    .type(InputType.text)
                    .value(value)
                    .onchange((e: any) => {
                        value.value = e.target.value;
                        onchange(e.target.value);
                    }).build(),
            ).build();
    }

    static rangeControl(path: string, val: any, icon: string, onchange: (e: any) => void) {
        if (isSignal(val)) {
            throw new Error("Range control can't be used with Signal");
        }
        const value = signal(path.startsWith("hue.") ? val / 3.6 : val);

        return create("div")
            .classes("control")
            .children(
                create("label").classes("flex")
                    .children(
                        Templates.icon(icon),
                        create("span").text(path).build()
                    ).build(),
                create("div").classes("flex")
                    .children(
                        create("input")
                            .type(InputType.range)
                            .attributes("min", 0, "max", 100, "step", 1)
                            .value(value)
                            .oninput((e: any) => {
                                const base = Number(e.target.value);
                                onchange(e);
                                value.value = base;
                            })
                            .build(),
                        create("span").classes("control-value").text(value).build(),
                        when(path.startsWith("hue."), Templates.colorIndicator(value, signal(100), signal(50))),
                        when(path.startsWith("saturation."), Templates.colorIndicator(signal(0), value, signal(50))),
                        when(path.startsWith("lightness."), Templates.colorIndicator(signal(0), signal(0), value)),
                        when(path.startsWith("transparency."), Templates.colorIndicator(signal(0), signal(0), value, '')),
                    ).build(),
            ).build();
    }

    static rangeIndicator(value: any, title: string, strokeColor = "var(--fg)") {
        const svgSize = 50;
        const radius = svgSize / 2;
        const strokeWidth = svgSize * 0.25;
        const circumference = Math.PI * radius * 2;
        const progress = compute((val: number) => Math.round(circumference * ((100 - val) / 100)) + "px", value);
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
                create("span").classes("control-value").text(value).build()
            ).title(title)
            .build();
    }

    static historyPanel(generator: any) {
        const history = generator.history;
        const activeIndex = generator.activeHistoryIndex;

        return create("div")
            .classes("history-panel")
            .onwheel((e: any) => {
                const historyPanel = document.querySelector(".history-panel") as HTMLElement;
                if (e.deltaX !== 0) return;
                const speed = 50;
                if (e.deltaY < 0) {
                    if (historyPanel.scrollLeft > 0) historyPanel.scrollLeft -= speed;
                } else if (e.deltaY > 0) {
                    if (historyPanel.scrollLeft < historyPanel.scrollWidth - historyPanel.clientWidth) historyPanel.scrollLeft += speed;
                }
            })
            .children(
                signalMap(history,
                    create("div").classes("flex").styles("width", "max-content"),
                    (item: any) => {
                        const index = compute((list: any[]) => list.indexOf(item), history);
                        let element: any;
                        const activeClass = compute((active: number) => {
                            if (active === (index as any).value && element) {
                                (element as HTMLElement).scrollIntoView(true);
                            }
                            return ((index as any).value === active) ? "active" : "_";
                        }, activeIndex);

                        element = create("div")
                            .classes("history-item", activeClass)
                            .children(Templates.canvas((item as any).imageData))
                            .onclick(() => {
                                generator.loadHistoryEntry((index as any).value);
                            })
                            .build();
                        return element;
                    })
            ).build();
    }

    static canvas(imageBitmap: ImageBitmap) {
        const canvas = create("canvas")
            .classes("canvas")
            .width("256")
            .height("144")
            .build() as HTMLCanvasElement;
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
        ctx.drawImage(imageBitmap, 0, 0);
        return canvas;
    }
}
