"use client"


import { ad_getAdminConfig, verifyAdminPass } from "@/(backend)/services/admin.service.serve";
import { AdminConfigType } from "@/__types__/admin.types";
import { GatewayTypes } from "@/__types__/db.types";
import SkeletonDashboard from "@/app/__components__/_loader/skeletonLoader";
import { Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { enqueueSnackbar } from "notistack";
import { SetStateAction, createContext, useEffect, useState } from "react";

type adminContextType = {
    is_verified: boolean,
    setVerified: VoidFunction | React.Dispatch<SetStateAction<boolean>>
    admin_config: AdminConfigType | null,
    setConfig: VoidFunction | React.Dispatch<SetStateAction<AdminConfigType>>
}

const initial_adminConfig = {
    QrCode: '',
    UpiIds: [],
    Gateway: GatewayTypes.DEFAULT,
    Usdt: false,
    UsdtAddress: ''
}

const initial_context = {
    is_verified: false,
    setVerified: () => undefined,
    admin_config: null,
    setConfig: () => undefined
}

export const ADMIN_CONTEXT = createContext<adminContextType>(initial_context);

export const AdminContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [is_verified, setVerified] = useState(false);
    const [password, setPassword] = useState<string | null>(null);
    const [admin_config, setConfig] = useState<AdminConfigType>(initial_adminConfig);
    const pathname = usePathname();

    useEffect(() => {
        console.warn(pathname)
        const boogieMan = sessionStorage.getItem("boogie_man");
        if (pathname.startsWith('/super_admin')) {
            setVerified(true);
        } else if (boogieMan === "true") {
            setVerified(true);
        } else if (!password) {
            const userInput = window.prompt("Enter admin password:");
            if (userInput) {
                setPassword(userInput); // Set password to trigger useQuery
            }
        }
    }, []);

    const { data: adminConfig, isFetched, isFetching } = useQuery({
        queryKey: ['admin', 'get_config'],
        queryFn: ad_getAdminConfig,
        enabled: true
    })

    const { data, isSuccess, isPending, isError } = useQuery({
        queryFn: () => verifyAdminPass(password || ""),
        queryKey: ["verify", "admin"],
        enabled: !!password, // Prevents execution if password is null
        retry: false, // No retries on failure
    });

    useEffect(() => {
        if (!isFetching && adminConfig?.valid && adminConfig.data) {
            console.warn(adminConfig.data);
            setConfig(adminConfig?.data)
        }
    }, [adminConfig, isFetched, isFetching])

    useEffect(() => {
        if (isSuccess && data?.valid) {
            enqueueSnackbar(data.msg);
            sessionStorage.setItem("boogie_man", "true");
            setVerified(true);
        }
    }, [isSuccess, data]);

    if (!is_verified && password && isPending) return <div className="h-screen w-screen flex justify-center items-center"> <Typography variant="h4" fontWeight={600}>Verifying...</Typography></div>;
    if (isError || (isSuccess && !data?.valid)) return <div className="h-screen w-screen flex justify-center items-center"> <Typography variant="h4" fontWeight={600}>{data?.msg || "Invalid password12"}</Typography></div>;
    if (isFetching) return <SkeletonDashboard />

    return (
        <ADMIN_CONTEXT.Provider value={{ is_verified, setVerified, admin_config, setConfig }}>
            {is_verified ? children : (
                <div className="h-screen w-screen flex justify-center items-center">
                    <Typography variant="h4" fontWeight={600}>Access Denied</Typography>
                </div>
            )}
        </ADMIN_CONTEXT.Provider>
    );
};