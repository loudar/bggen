import {create} from "https://fjs.targoninc.com/f.mjs";

export class Templates {
    static buttonWithIcon(icon, text, onclick, classes = []) {
        return create("button")
            .classes("flex", ...classes)
            .onclick(onclick)
            .children(
                create("i")
                    .classes("material-icons")
                    .text(icon)
                    .build(),
                create("span")
                    .text(text)
                    .build()
            ).build();
    }
}