import { USER_SERVICE_SERV } from "@/(backend)/services/user.service.serv"
import { ServiceResponse } from "@/__types__/service.types";

type T = any
type ServiceMethods = keyof typeof USER_SERVICE_SERV;

export default async function UserServiceServerWrapper({ fnName, children }:
    { fnName: ServiceMethods, children: (res: ServiceResponse<T>) => React.ReactNode; }) {
    const method = USER_SERVICE_SERV[fnName]; // Get method

    if (typeof method !== "function") {
        throw new Error(`Invalid function name: ${ fnName }`);
    }

    const res = await method(); // Call the function

    return (
        <>
            {children(res)}
        </>
    )
}