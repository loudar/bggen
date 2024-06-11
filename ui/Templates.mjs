import {create, computedSignal, signal, store} from "https://fjs.targoninc.com/f.mjs";
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

    static colorIndicator(h, s, l) {
        const canvas = create("canvas")
            .classes("color-indicator")
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
}