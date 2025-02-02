import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;

export const VerifyToken = async (token: string) => {
    try {
  
      const decoded = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
      return { success: true, decoded: decoded?.payload || "" };
  
    } catch (error) {
  
      console.error("Token verification error:", error);
      return { success: false, error: "Invalid token" };
  
    }
  }
  