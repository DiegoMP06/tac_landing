import Alpine from "alpinejs";
import { themeToggle } from "./components/app/theme-toggle";
import { navMobileToggle } from "./components/app/nav-mobile-toggle";

export default function () {
    Alpine.data('themeToggle', themeToggle);
    Alpine.data('navMobileToggle', navMobileToggle);
}