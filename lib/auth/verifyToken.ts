import { JWTPayload, jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET;
type payload = JWTPayload & {
  PhoneNumber ?: string
}
type returnType = {success: boolean, decoded ?: payload | "", error ?: string }

export const VerifyToken = async (token: string): Promise<returnType> => {
    try {
  
      const decoded = await jwtVerify(token, new TextEncoder().encode(SECRET_KEY));
      return { success: true, decoded: decoded?.payload || "" };
  
    } catch (error) {
      console.log(error);
      return { success: false, error: "Invalid token" };
  
    }
  }
  