export function save() {
  const canvas = document.getElementById("target") as HTMLCanvasElement;
  if (!canvas) return;
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "image.png";
  a.click();
}
