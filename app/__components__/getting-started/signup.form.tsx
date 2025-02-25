import { Button, CircularProgress, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CustomInput } from "./customInput";
import { validateInput } from "@/lib/helpers/validateForm";
import { init_user_auth_mutation } from "@/sActions/userLoginSignupMutation";
import { useMutation } from "@tanstack/react-query";

/* ====================== SIGNUP FORM ====================== */
export const SignupForm = ({ setQueryParam }: { setQueryParam: (key: string, value: string) => void }) => {

    const searchParams = useSearchParams();
    const invitedBy = searchParams.get("invitedBy") || "";

    const [formData, setFormData] = useState({ phonenumber: "", password: "", name: "", parent: invitedBy });

    const { isPending, isSuccess, data, mutate } = useMutation({
        mutationFn: async () => {
            const formDataObj = new FormData();
            formDataObj.append("type", "signup");
            Object.entries(formData).forEach(([key, value]) => formDataObj.append(key, value));
            return await init_user_auth_mutation(null, formDataObj);
        },
    });

    const router = useRouter();
    if (isSuccess && data.success) {
        router.push('/')
        return <>Redirecting...</>
    }

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

            {!data?.success && <Typography mt={2} color="red">{data?.msg}</Typography>}
            {data?.success && <Typography mt={2} color="green">{data?.msg}</Typography>}

            <motion.form onSubmit={(e) => {
                e.preventDefault();
                mutate();
            }}>

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

                <Button type="submit" fullWidth variant="contained" sx={{ mt: 5, bgcolor: "#78dafb", py: 2, fontSize: 14, textTransform: 'initial', color: "black", fontWeight: 700 }}>
                    {isPending ? <CircularProgress sx={{ color: 'black' }} size={'1rem'} /> : "Sign up"}
                </Button>
            </motion.form>
        </>
    );
};
