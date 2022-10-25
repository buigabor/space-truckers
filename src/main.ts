import { AppStartScene as App } from "./AppStartScene";

window.addEventListener("DOMContentLoaded", () => {
    let canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    let app = new App(canvas);
    app.run();
});
