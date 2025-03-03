"use client"


import { verifyAdminPass } from "@/(backend)/services/admin.service.serve";
import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { SetStateAction, createContext, useEffect, useState } from "react";

type adminContextType = {
    is_verified: boolean,
    setVerified: VoidFunction | React.Dispatch<SetStateAction<boolean>>
}

const initial_context = {
    is_verified: false,
    setVerified: () => undefined
}

export const ADMIN_CONTEXT = createContext<adminContextType>(initial_context);

export const AdminContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [is_verified, setVerified] = useState(false);
    const [password, setPassword] = useState<string | null>(null);

    useEffect(() => {
        const boogieMan = sessionStorage.getItem("boogie_man");
        if (boogieMan === "true") {
            setVerified(true);
        } else {
            const userInput = window.prompt("Enter admin password:");
            if (userInput) {
                setPassword(userInput); // Set password to trigger useQuery
            }
        }
    }, []);

    const { data, isSuccess, isPending, isError } = useQuery({
        queryFn: () => verifyAdminPass(password || ""),
        queryKey: ["verify", "admin"],
        enabled: !!password, // Prevents execution if password is null
        retry: false, // No retries on failure
    });

    useEffect(() => {
        if (isSuccess && data?.valid) {
            enqueueSnackbar(data.msg);
            sessionStorage.setItem("boogie_man", "true");
            setVerified(true);
        }
    }, [isSuccess, data]);

    if (!is_verified && password && isPending) return <div className="h-screen w-screen flex justify-center items-center"> <Typography variant="h4" fontWeight={600}>Verifying...</Typography></div>;
    if (isError || (isSuccess && !data?.valid)) return <div className="h-screen w-screen flex justify-center items-center"> <Typography variant="h4" fontWeight={600}>{data?.msg || "Invalid password12"}</Typography></div>;

    return (
        <ADMIN_CONTEXT.Provider value={{ is_verified, setVerified }}>
            {is_verified ? children : (
                <div className="h-screen w-screen flex justify-center items-center">
                    <Typography variant="h4" fontWeight={600}>Access Denied</Typography>
                </div>
            )}
        </ADMIN_CONTEXT.Provider>
    );
};