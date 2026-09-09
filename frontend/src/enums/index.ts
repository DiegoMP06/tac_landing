export const BrandsEnum = {
    ACU: "acu",
    ACC: "acc",
    ACM: "acm",
    DEFAULT: "default",
} as const;

export const ModalitiesEnum = {
    IN_PERSON: "in_person",
    HYBRID: "hybrid",
    ONLINE: "online",
} as const;

export const SubBrands = Object.values(BrandsEnum).filter(
    (brand) => brand !== BrandsEnum.DEFAULT,
);
