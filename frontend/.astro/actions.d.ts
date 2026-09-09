declare module "astro:actions" {
		export const actions: typeof import("/app/src/actions/index.ts")["server"];
}