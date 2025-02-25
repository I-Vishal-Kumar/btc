"use client"
import { getUserDetails } from "@/(backend)/services/user.service.serv";
import { UserType } from "@/__types__/user.types";
import SkeletonDashboard from "@/app/__components__/_loader/skeletonLoader";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { SetStateAction, createContext, useEffect, useState } from "react";

const User: UserType = {
    _id: '',
    Balance: 0,
    InvitationCode: '',
    Name: '',
    Parent: '',
    PhoneNumber: '',
    Profit: 0,
    ReferalCount: 0,
    Blocked: false,
    Commission: 0,
    HoldingScore: 0,
    Level1Deposit: 0,
    Level1Withdrawal: 0,
    LastSpinAt: ''
}

type context_type = {
    userInfo: UserType,
    setUserInfo: VoidFunction | React.Dispatch<SetStateAction<UserType>>
}

export const USER_CONTEXT = createContext<context_type>({
    userInfo: User,
    setUserInfo: () => undefined
});

export const UserContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [userInfo, setUserInfo] = useState<UserType>(User);

    const { data, isSuccess, isPending, isError } = useQuery({
        queryKey: ['user'],
        queryFn: getUserDetails
    })

    useEffect(() => {
        if (isSuccess && data?.data) setUserInfo(data.data)
    }, [isSuccess, data]);

    const router = useRouter();

    if (isPending) return <SkeletonDashboard />;

    if (isError || !data || !data.valid) {
        router.push('/getting-started');
        return;
    };

    return (
        <USER_CONTEXT.Provider value={{ userInfo, setUserInfo }}  >
            <AnimatePresence mode="wait">
                <motion.div
                    key="layout"
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1, transition: { duration: 0.1, ease: "easeOut" } }}
                    exit={{ scale: 0.6, transition: { duration: 0.8, ease: "easeInOut" } }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </USER_CONTEXT.Provider>
    )
}