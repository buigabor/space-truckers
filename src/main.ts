import { SpaceTruckerApplication } from "./SpaceTruckerApplication";

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const app = new SpaceTruckerApplication(canvas);

const launchButton = document.getElementById("launchBtn");
const pageLandingContent = document.getElementById("pageContainer");

const launchButtonHandler = () => {
    launchButton?.removeEventListener("click", launchButtonHandler);

    if (pageLandingContent) {
        pageLandingContent.style.display = "none";
    }

    canvas.classList.remove("background-canvas");
    app.run();
};

launchButton?.addEventListener("click", launchButtonHandler);

window.addEventListener("DOMContentLoaded", () => {});
