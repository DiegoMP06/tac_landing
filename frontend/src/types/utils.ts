export type NestedPaths<T> =
    T extends Record<string, any>
        ? {
              [K in keyof T & string]: T[K] extends Record<string, any>
                  ? `${K}.${NestedPaths<T[K]>}`
                  : K;
          }[keyof T & string]
        : never;
