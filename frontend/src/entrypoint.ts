import intersectPlugin from "@alpinejs/intersect";
import type { Alpine } from "alpinejs";
import registerScripts from "./scripts";

export default (Alpine: Alpine) => {
    Alpine.plugin(intersectPlugin);

    registerScripts();
};