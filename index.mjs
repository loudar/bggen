import {Generator} from "./Generator.mjs";
import {Templates} from "./Templates.mjs";

const canvas = document.getElementById("target");

const generator = new Generator(canvas);
const controls = document.getElementById("controls");
generator.getControlProperties().forEach(control => controls.appendChild(control));
controls.appendChild(Templates.buttonWithIcon("refresh", "Generate", () => generator.generateImage()));
controls.appendChild(
    Templates.buttonWithIcon("file_download", "Download", () => {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "image.png";
        a.click();
    })
);
generator.generateImage();
