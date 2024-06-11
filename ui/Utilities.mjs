export function save() {
    const canvas = document.getElementById("target");
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "image.png";
    a.click();
}