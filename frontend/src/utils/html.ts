import sanitizeHtmlLib from "sanitize-html";

const ALLOWED_TAGS = [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "span",
    "a",
    "ul",
    "ol",
    "li",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "img",
    "figure",
    "figcaption",
];

const TAGS_BLOCKED = [
    "script",
    "style",
    "textarea",
    "noscript",
    "iframe",
    "object",
    "embed",
];

const ATTRIBUTES_ALLOW = [
    "href",
    "title",
    "target",
    "rel",
    "src",
    "alt",
    "width",
    "height",
];

const ATTRIBUTES_ALLOW_WITH_CLASS = [
    "href",
    "title",
    "target",
    "rel",
    "src",
    "alt",
    "width",
    "height",
    "class",
];

const ALLOWED_ATTRIBUTES: sanitizeHtmlLib.IOptions["allowedAttributes"] = {
    a: ATTRIBUTES_ALLOW_WITH_CLASS,
    img: ATTRIBUTES_ALLOW,
    span: ATTRIBUTES_ALLOW_WITH_CLASS,
    p: ATTRIBUTES_ALLOW_WITH_CLASS,
};

const ALLOWED_SCHEMES = ["http", "https", "mailto"];

const SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedSchemes: ALLOWED_SCHEMES,
    nonTextTags: TAGS_BLOCKED,
    transformTags: {
        a: sanitizeHtmlLib.simpleTransform(
            "a",
            { rel: "noopener noreferrer" },
            true,
        ),
    },
    parseStyleAttributes: false,
};

export function sanitizeHtml(html: string): string {
    const sanitized = sanitizeHtmlLib(html, SANITIZE_OPTIONS);

    return sanitized.replace(/\s+/g, " ").trim();
}

export const clearHtmlToString = (text: string) => {
    const cleanText = sanitizeHtml(text);
    return cleanText.replace(/<[^>]*>/g, " ").trim();
};