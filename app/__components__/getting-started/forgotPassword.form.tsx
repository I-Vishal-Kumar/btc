import { init_user_auth_mutation } from "@/sActions/userLoginSignupMutation";
import { Button, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import { CustomInput } from "./customInput";
import { validateInput } from "@/lib/helpers/validateForm";
import { useMutation } from "@tanstack/react-query";

/* ====================== FORGOT PASSWORD FORM ====================== */
export const ForgotPasswordForm = ({ setQueryParam }: { setQueryParam: (key: string, value: string) => void }) => {
    const [formData, setFormData] = useState({ phonenumber: '', oldpassword: "", newpassword: "" });

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: async () => {
            const formDataObj = new FormData();
            formDataObj.append("type", "forget-password");
            Object.entries(formData).forEach(([key, value]) => formDataObj.append(key, value));
            return await init_user_auth_mutation(null, formDataObj);
        },
    });

    if (isSuccess && data.success) {
        setQueryParam("type", "forgot-password");
        return <>Redirecting...</>
    }

    return (
        <>

            {!data?.success && <Typography mt={2} color="red">{data?.msg}</Typography>}
            {data?.success && <Typography mt={2} color="green">{data?.msg}</Typography>}

            <motion.form onSubmit={(e) => {
                e.preventDefault();
                mutate();
            }}>

                <CustomInput label="Phone number" type="text" name="phonenumber"
                    isValid={validateInput('phonenumber', formData.phonenumber)}
                    value={formData.phonenumber} onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })} />

                <CustomInput label="Old Password" type="password" name="oldpassword"
                    isValid={validateInput('password', formData.oldpassword)}
                    value={formData.oldpassword} onChange={(e) => setFormData({ ...formData, oldpassword: e.target.value })} />

                <CustomInput label="New Password" type="password" name="newpassword"
                    isValid={validateInput('password', formData.newpassword)}
                    value={formData.newpassword} onChange={(e) => setFormData({ ...formData, newpassword: e.target.value })} />

                <Typography fontSize={12} color="black" fontWeight={500} onClick={() => window.open('https://t.me/BTC_CS_SUPPORT', "_blank")?.focus()} style={{ cursor: "pointer", marginTop: "0.5rem" }}>
                    Customer Support
                </Typography>

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 4, bgcolor: "#78dafb", color: "black", textTransform: 'initial', py: 2, fontWeight: 700 }}>
                    {isPending ? <CircularProgress sx={{ color: 'black' }} size={'1rem'} /> : " Reset Password"}
                </Button>
            </motion.form>

        </>
    );
};