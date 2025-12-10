import { Generator } from "./Generator";
import { Templates } from "./Templates";
import { save } from "./Utilities";
import {signal} from "@targoninc/jess";

const canvas = document.getElementById("target") as HTMLCanvasElement;

export const lastGenTime = signal(0);

const generator = new Generator(canvas);
(window as any).generator = generator;
const controls = document.getElementById("controls") as HTMLElement;
controls.appendChild(Templates.controlPanel(generator));
generator.generateImage();
const history = document.getElementById("history") as HTMLElement;
history.appendChild(Templates.historyPanel(generator as any));

const shortcuts = {
  generateShortcut: "g",
  saveShortcut: "s",
  keepCurrentItems: "k",
  keepCurrentColors: "c",
  toggleAnimation: "a",
  loadPreviousImage: "ArrowLeft",
  loadNextImage: "ArrowRight",
};

document.addEventListener("keydown", e => {
  const target = e.target as HTMLElement;
  if (target && target.tagName === "INPUT") {
    return;
  }
  if (e.key === shortcuts.generateShortcut) {
    generator.generateImage();
  }
  if (e.key === shortcuts.saveShortcut) {
    save();
  }
  if (e.key === shortcuts.keepCurrentItems) {
    generator.setSettingValue("keepCurrentItems", !generator.getSettingValue("keepCurrentItems"));
  }
  if (e.key === shortcuts.keepCurrentColors) {
    generator.setSettingValue("keepCurrentColors", !generator.getSettingValue("keepCurrentColors"));
  }
  if (e.key === shortcuts.toggleAnimation) {
    (generator as any).renderer.animationActive = !(generator as any).renderer.animationActive;
  }
  if (e.key === shortcuts.loadPreviousImage) {
    generator.loadHistoryEntry();
  }
  if (e.key === shortcuts.loadNextImage) {
    generator.loadHistoryEntry((generator as any).activeHistoryIndex.value + 1);
  }
});

const fps = 30;
setInterval(() => {
  (window as any).generator.renderer.animateFrame();
}, 1000 / fps);
