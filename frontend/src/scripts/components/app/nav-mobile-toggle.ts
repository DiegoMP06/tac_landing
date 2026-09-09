export const navMobileToggle = () => ({
    isOpen: false,

    init() {
        const mediaQuery = window.matchMedia("(min-width: 1024px)");
        mediaQuery.addEventListener("change", (e) => {
            if (e.matches && this.isOpen) {
                this.isOpen = false;
            }
        });
    },

    toggle() {
        this.isOpen = !this.isOpen;
    },
});
