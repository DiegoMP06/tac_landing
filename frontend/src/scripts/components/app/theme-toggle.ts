export const themeToggle = () => ({
    dark: false,

    init() {
        this.dark = document.documentElement.classList.contains("dark");
    },

    toggle() {
        this.dark = !this.dark;

        document.documentElement.classList.toggle("dark", this.dark);

        document.cookie = `theme=${this.dark ? "dark" : "light"}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;

        localStorage.setItem("theme", this.dark ? "dark" : "light");
    },
});
