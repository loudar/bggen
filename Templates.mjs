import {create, computedSignal, signal} from "https://fjs.targoninc.com/f.mjs";

export class Templates {
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
                contentElement.style.maxHeight = contentElement.scrollHeight + 'px';
            } else {
                contentElement.style.maxHeight = '0';
            }
        };

        contentElement = create("div")
            .classes("collapsible-content")
            .id(uniqueId)
            .children(content)
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
}