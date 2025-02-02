import { userMutation } from "@/sActions/userLoginSignupMutation";
import { Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useState, useActionState } from "react";
import { CustomInput } from "./customInput";
import { validateInput } from "@/lib/helpers/validateForm";

/* ====================== SIGNUP FORM ====================== */
export const SignupForm = ({ setQueryParam }: { setQueryParam: (key: string, value: string) => void }) => {
    const searchParams = useSearchParams();
    const invitedBy = searchParams.get("invitedBy") || "";

    const [formData, setFormData] = useState({ phonenumber: "", password: "", name: "", parent: invitedBy });
    const [formState, formAction] = useActionState(userMutation, { success: false, message: "", error: "" });

    return (
        <>
            <div className="flex gap-x-1 text-black mt-2">
                <Typography fontSize={12} fontWeight={500} onClick={() => setQueryParam("type", "login")} style={{ cursor: "pointer" }}>
                    I Am A Old User
                </Typography>
                <Typography fontSize={12}>/</Typography>
                <Typography fontSize={12} fontWeight={700} onClick={() => setQueryParam("type", "signup")} style={{ cursor: "pointer" }}>
                    Create New
                </Typography>
            </div>
            <motion.form action={formAction}>
                <input type="hidden" name="type" value="signup" />

                <CustomInput label="Phone Number" name="phonenumber" inputMode="numeric"
                    isValid={validateInput('phonenumber', formData.phonenumber)}
                    value={formData.phonenumber} onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })} />

                <CustomInput label="Password" type="password" name="password"
                    isValid={validateInput('password', formData.password)}
                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />

                <CustomInput label="Full Name" name="name"
                    isValid={validateInput('name', formData.name)}
                    value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />

                <CustomInput label="Invitation Code" name="parent"
                    isValid={validateInput('parent', formData.parent)}
                    value={formData.parent} disabled onChange={(e) => setFormData({ ...formData, parent: e.target.value })} />

                <Typography fontSize={12} color="black" fontWeight={500} onClick={() => setQueryParam("type", "login")} style={{ cursor: "pointer", marginTop: "1rem" }}>
                    Customer Support
                </Typography>

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 5, bgcolor: "#78dafb", py: 2, textTransform: 'initial', color: "black", fontWeight: 700 }}>
                    Sign Up
                </Button>
            </motion.form>

            {formState.error && <Typography mt={2} color="red">{formState.error}</Typography>}
            {formState.success && <Typography mt={2} color="green">{formState.message}</Typography>}
        </>
    );
};
