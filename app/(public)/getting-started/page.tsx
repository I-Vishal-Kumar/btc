"use client"

import { useQueryParams } from "@/lib/hooks/useQueryParams";
import { Box, Container, Typography } from "@mui/material";
import Image from "next/image";
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/app/__components__/getting-started/login.form";
import { SignupForm } from "@/app/__components__/getting-started/signup.form";
import { ForgotPasswordForm } from "@/app/__components__/getting-started/forgotPassword.form";


export default function AuthForm() {

    const searchParams = useSearchParams();
    const { setQueryParam } = useQueryParams();
    const type = searchParams.get("type") || "login"; // Default to login

    return (
        <Container disableGutters maxWidth="md" sx={{ height: "100vh", overflow: "hidden", width: "100vw", position: "relative" }}>
            <div className="absolute top-0 left-0 w-full h-full">
                <Image className="absolute top-0 left-0 h-full contrast-50 brightness-110 w-full object-cover" src={"/getting-started/bg.jpg"} alt="background" fill />
                <div className="absolute inset-0 bg-yellow-100 opacity-80 mix-blend-multiply"></div>
            </div>

            <div className="absolute bottom-0 w-full px-12 pb-20">
                <div className="w-[50%] h-20 relative">
                    <Image alt="logo" className="aspect-video" fill src={"/getting-started/logo_full.png"} />
                </div>

                <Box>
                    <Typography fontWeight={800} fontSize={28} color="black">
                        {type === "signup" ? "Create Account" : type === "forgot-password" ? "Forgot Password!" : "Login Now!"}
                    </Typography>
                </Box>

                {/* Switch Between Forms */}
                {type === "login" && <LoginForm setQueryParam={setQueryParam} />}
                {type === "signup" && <SignupForm setQueryParam={setQueryParam} />}
                {type === "forgot-password" && <ForgotPasswordForm setQueryParam={setQueryParam} />}
            </div>
        </Container>
    );
}