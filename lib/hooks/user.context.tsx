"use client"
import { USER_SERVICE } from "@/(backend)/services/user.service";
import { UserType } from "@/__types__/user.types";
import { useQuery } from "@tanstack/react-query";
import { SetStateAction, createContext, useState } from "react";

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
        queryFn: USER_SERVICE.getUser
    })

    if (isSuccess && data?.data) setUserInfo(data.data)

    if (isPending) return <>...loading</>;
    if (isError || !data || !data.valid) return <>Error....</>;

    return (
        <USER_CONTEXT.Provider value={{ userInfo, setUserInfo }}  >
            {children}
        </USER_CONTEXT.Provider>
    )
}