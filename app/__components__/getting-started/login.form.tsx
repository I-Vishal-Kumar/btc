import { Button, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useState, ChangeEvent } from "react";
import { CustomInput } from "./customInput";
import { validateInput } from "@/lib/helpers/validateForm";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { init_user_auth_mutation } from "@/sActions/userLoginSignupMutation";

/* ====================== LOGIN FORM ====================== */
export const LoginForm = ({ setQueryParam }: { setQueryParam: (key: string, value: string) => void }) => {
    const [formData, setFormData] = useState({ phonenumber: "", password: "" });

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: async () => {
            const formDataObj = new FormData();
            formDataObj.append("type", "login");
            Object.entries(formData).forEach(([key, value]) => formDataObj.append(key, value));
            return await init_user_auth_mutation(null, formDataObj);
        },
    });

    const router = useRouter();
    if (isSuccess && data.success) {
        router.push('/')
        return <>Redirecting...</>;
    }

    return (
        <>

            <div className="flex gap-x-1 text-black mt-2">
                <Typography fontSize={12} fontWeight={700} onClick={() => setQueryParam("type", "login")} style={{ cursor: "pointer" }}>
                    I Am A Old User
                </Typography>
                <Typography fontSize={12}>/</Typography>
                <Typography fontSize={12} fontWeight={500} onClick={() => setQueryParam("type", "signup")} style={{ cursor: "pointer" }}>
                    Create New
                </Typography>
            </div>

            {!data?.success && <Typography mt={2} fontWeight={500} color="red">{data?.msg}</Typography>}
            {data?.success && <Typography mt={2} fontWeight={500} color="green">{data?.msg}</Typography>}

            <motion.form onSubmit={(e) => {
                e.preventDefault();
                mutate();
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
                    <Typography fontSize={12} fontWeight={500} onClick={() => setQueryParam("type", "forgot-password")} style={{ cursor: "pointer" }}>
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
