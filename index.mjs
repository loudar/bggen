import {Generator} from "./Generator.mjs";
import {Templates} from "./Templates.mjs";
import {computedSignal, signal, store} from "https://fjs.targoninc.com/f.mjs";

const canvas = document.getElementById("target");

store().set("lastGenTime", signal(0));
const buttonText = computedSignal(store().get("lastGenTime"), time => `Generate (${time}ms)`);

const generator = new Generator(canvas);
const controls = document.getElementById("controls");
generator.getControls().forEach(group => controls.appendChild(group));
controls.appendChild(Templates.buttonWithIcon("refresh", buttonText, () => {
    const start = performance.now();
    generator.generateImage();
    store().setSignalValue("lastGenTime", performance.now() - start);
}));
controls.appendChild(
    Templates.buttonWithIcon("file_download", "Download", () => {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "image.png";
        a.click();
    })
);
generator.generateImage();
