import type { LocalesEnum } from "@/enums/locale";
import type { ui } from "@/i18n/ui";
import type { NestedPaths } from "./utils";

export type Locale = (typeof LocalesEnum)[keyof typeof LocalesEnum];

export type UiKeys = NestedPaths<(typeof ui)["es"]>;

