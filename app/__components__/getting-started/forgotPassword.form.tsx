import { forgotPassword } from "@/sActions/userLoginSignupMutation";
import { Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useState, useActionState } from "react";
import { CustomInput } from "./customInput";
import { validateInput } from "@/lib/helpers/validateForm";

/* ====================== FORGOT PASSWORD FORM ====================== */
export const ForgotPasswordForm = ({ setQueryParam }: { setQueryParam: (key: string, value: string) => void }) => {
    const [formData, setFormData] = useState({ oldPassword: "", newPassword: "" });
    const [formState, formAction] = useActionState(forgotPassword, { success: false, message: "", error: "" });

    return (
        <>

            <motion.form action={formAction}>
                <input type="hidden" name="type" value="forgot-password" />

                <CustomInput label="Old Password" type="password" name="oldPassword"
                    isValid={validateInput('password', formData.oldPassword)}
                    value={formData.oldPassword} onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })} />

                <CustomInput label="New Password" type="password" name="newPassword"
                    isValid={validateInput('password', formData.newPassword)}
                    value={formData.newPassword} onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />

                <Typography fontSize={12} color="black" fontWeight={500} onClick={() => setQueryParam("type", "login")} style={{ cursor: "pointer", marginTop: "0.5rem" }}>
                    Customer Support
                </Typography>

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 4, bgcolor: "#78dafb", color: "black", textTransform: 'initial', py: 2, fontWeight: 700 }}>
                    Reset Password
                </Button>
            </motion.form>

            {formState.error && <Typography mt={2} color="red">{formState.error}</Typography>}
            {formState.success && <Typography mt={2} color="green">{formState.message}</Typography>}
        </>
    );
};