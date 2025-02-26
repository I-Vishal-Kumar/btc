"use client"
import { getWalletDetails } from "@/(backend)/services/user.service.serv";
import { UserWallet } from "@/__types__/user.types";
import SkeletonDashboard from "@/app/__components__/_loader/skeletonLoader";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { SetStateAction, createContext, useEffect, useState } from "react";

const User: UserWallet = {
    PhoneNumber: '',
}

type context_type = {
    wallet: UserWallet,
    setWallet: VoidFunction | React.Dispatch<SetStateAction<UserWallet>>
}

export const WALLET_CONTEXT = createContext<context_type>({
    wallet: User,
    setWallet: () => undefined
});

export const WalletContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [wallet, setWallet] = useState<UserWallet>(User);

    const { data, isSuccess, isPending, isError } = useQuery({
        queryKey: ['wallet'],
        queryFn: getWalletDetails
    })

    useEffect(() => {
        if (isSuccess && data?.data) setWallet(data.data)
    }, [isSuccess, data]);

    const router = useRouter();

    if (isPending) return <SkeletonDashboard />;

    if (isError || !data || !data.valid) {
        router.push('/getting-started');
        return;
    };

    return (
        <WALLET_CONTEXT.Provider value={{ wallet, setWallet }}  >
            {children}
        </WALLET_CONTEXT.Provider>
    )
}