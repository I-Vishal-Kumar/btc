import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export async function generateSessionToken(payload: {PhoneNumber: string}) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setJti(crypto.randomUUID())
        .setIssuedAt()
        .setExpirationTime("1d")
        .sign(new TextEncoder().encode(JWT_SECRET));
    return token;
}
