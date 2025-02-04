"use client"
import { getUserDetails } from "@/(backend)/services/user.service.serv";
import { UserType } from "@/__types__/user.types";
import { useQuery } from "@tanstack/react-query";
import { SetStateAction, createContext, useEffect, useState } from "react";

const User: UserType = {
    _id: '',
    Balance: 0,
    InvitationCode: 0,
    Name: '',
    Parent: 0,
    PhoneNumber: '',
    Profit: 0,
    ReferalCount: 0
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

    if (isPending) return <>...loading</>;
    if (isError || !data || !data.valid) return <>Error....</>;

    return (
        <USER_CONTEXT.Provider value={{ userInfo, setUserInfo }}  >
            {children}
        </USER_CONTEXT.Provider>
    )
}