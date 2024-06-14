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
const history = document.getElementById("history");
history.appendChild(Templates.historyPanel(generator));

const shortcuts = {
    generateShortcut: "g",
    saveShortcut: "s",
    keepCurrentItems: "k",
    toggleAnimation: "a",
    loadPreviousImage: "ArrowLeft",
    loadNextImage: "ArrowRight",
};

document.addEventListener("keydown", e => {
    if (e.target.tagName === "INPUT") {
        return;
    }

    if (e.key === shortcuts.generateShortcut) {
        generator.generateImage();
    }
    if (e.key === shortcuts.saveShortcut) {
        save();
    }
    if (e.key === shortcuts.keepCurrentItems) {
        generator.settings["keepCurrentItems"].value = !generator.settings["keepCurrentItems"].value;
    }
    if (e.key === shortcuts.toggleAnimation) {
        generator.renderer.animationActive = !generator.renderer.animationActive;
    }
    if (e.key === shortcuts.loadPreviousImage) {
        generator.loadHistoryEntry();
    }
    if (e.key === shortcuts.loadNextImage) {
        generator.loadHistoryEntry(generator.activeHistoryIndex.value + 1);
    }
});

const fps = 30;
setInterval(() => {
    window.generator.renderer.animateFrame();
}, 1000 / fps);