export const getClientIP = (request: Request, clientAddress?: string): string => {
    const xForwardedFor = request.headers.get("x-forwarded-for");
    if (xForwardedFor) {
        return xForwardedFor.split(",")[0].trim();
    }

    const cfConnectingIP = request.headers.get("cf-connecting-ip");
    if (cfConnectingIP) return cfConnectingIP;

    const realIP = request.headers.get("x-real-ip");
    if (realIP) return realIP;

    return clientAddress || "127.0.0.1";
};