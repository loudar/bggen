import {Generator} from "./Generator.mjs";
import {signal, store} from "https://fjs.targoninc.com/f.mjs";
import {Templates} from "./Templates.mjs";
import {save} from "./Utilities.mjs";

const canvas = document.getElementById("target");

store().set("lastGenTime", signal(0));

const generator = new Generator(canvas);
window.generator = generator;
const controls = document.getElementById("controls");
controls.appendChild(Templates.controlPanel(generator));
generator.generateImage();

const shortcuts = {
    generateShortcut: "g",
    saveShortcut: "s",
    keepCurrentItems: "k"
};

document.addEventListener("keydown", e => {
    if (e.key === shortcuts.generateShortcut) {
        generator.generateImage();
    }
    if (e.key === shortcuts.saveShortcut) {
        save();
    }
    if (e.key === shortcuts.keepCurrentItems) {
        this.generator.settings["keepCurrentItems"].value = !this.generator.settings["keepCurrentItems"].value;
    }
});

setInterval(() => {
    generator.generateImage();
}, 5000);