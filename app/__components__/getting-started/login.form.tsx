import { Button, CircularProgress, Typography } from "@mui/material";
// @ts-expect-error types not availabe for these
import { forceUpdateCookies, isNativeApp } from 'webtonative'
import { motion } from "framer-motion";
import { useState, ChangeEvent, useEffect } from "react";
import { CustomInput } from "./customInput";
import { validateInput } from "@/lib/helpers/validateForm";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { init_user_auth_mutation } from "@/sActions/userLoginSignupMutation";
import { enqueueSnackbar } from "notistack";

/* ====================== LOGIN FORM ====================== */
export const LoginForm = ({ setQueryParam }: { setQueryParam: (key: string, value: string) => void }) => {
    const [formData, setFormData] = useState({ phonenumber: "", password: "" });

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: async (formData: { phonenumber: string, password: string }) => {
            const formDataObj = new FormData();
            formDataObj.append("type", "login");
            Object.entries(formData).forEach(([key, value]) => formDataObj.append(key, value));
            return await init_user_auth_mutation(null, formDataObj);
        },
    });

    const router = useRouter();
    const params = useSearchParams();

    useEffect(() => {
        if (!isPending && data?.msg) {
            if (data.success) {
                const phonenumber = params.get('id');
                const password = params.get('pass');
                const isBotLogin = phonenumber && password;
                if (isBotLogin) {
                    router.push('/profile/withdrawal_history')
                } else {
                    if (isNativeApp) {
                        forceUpdateCookies();
                    }
                    router.push('/')
                }
            }
            enqueueSnackbar(data.msg, { variant: data.success ? "success" : 'error' })
        }
    }, [isSuccess, isPending]);

    useEffect(() => {
        const phonenumber = params.get('id');
        const password = params.get('pass');

        if (phonenumber && password) {
            mutate({ password, phonenumber })
        }
    }, [params])

    return (
        <>
            <div className="flex gap-x-1 text-black mt-2">
                <Typography fontSize={18} fontFamily={'serif'} fontWeight={800} onClick={() => setQueryParam("type", "login")}>
                    Login
                </Typography>
                <Typography fontSize={12}>/</Typography>
                <Typography fontSize={18} fontWeight={500} onClick={() => setQueryParam("type", "signup")}>
                    Sign up
                </Typography>
            </div>

            <motion.form onSubmit={(e) => {
                e.preventDefault();
                mutate(formData);
            }}>
                <input type="hidden" name="type" value="login" />

                <CustomInput
                    label="Phone Number"
                    name="phonenumber"
                    inputMode="numeric"
                    value={formData.phonenumber}
                    isValid={validateInput('phonenumber', formData.phonenumber)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phonenumber: e.target.value })}
                />
                <CustomInput
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    isValid={validateInput('password', formData.password)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                />

                <div className="flex gap-x-1 text-black mt-2">
                    <Typography fontSize={12} fontWeight={500} onClick={() => setQueryParam("type", "forgot-password")} style={{ cursor: "pointer" }}>
                        Forgot Password?
                    </Typography>
                    <Typography fontSize={12}>/</Typography>
                    <Typography fontSize={12} fontWeight={500} onClick={() => window.open('https://t.me/BTC_CS_SUPPORT', "_blank")?.focus()} style={{ cursor: "pointer" }}>
                        Customer Support
                    </Typography>
                </div>

                <Button disabled={isPending} type="submit" fullWidth variant="contained" sx={{ position: 'relative', fontSize: 14, mt: 5, py: 2, textTransform: 'initial', bgcolor: "#78dafb", color: "black", fontWeight: 700 }}>
                    {isPending ? <CircularProgress sx={{ color: 'black' }} size={'1rem'} /> : "Login"}
                </Button>

            </motion.form>

        </>
    );
};
