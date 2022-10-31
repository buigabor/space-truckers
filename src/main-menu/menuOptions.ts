import { EventState } from "@babylonjs/core";
import { Vector2WithInfo } from "@babylonjs/gui";

export interface MenuItemOptions {
    name?: string;
    title?: string;
    background?: string;
    color?: string;
    onInvoked?: (ed: Vector2WithInfo, es: EventState) => void;
}

export const playBtnOptions: MenuItemOptions = {
    name: "btPlay",
    title: "Play",
    background: "red",
    color: "white",
    onInvoked: () => console.log("Play button clicked"),
};

export const menuBackground = `https://raw.githubusercontent.com/jelster/space-truckers/ch4/assets/menuBackground.png?${Number(
    new Date()
)}`;
