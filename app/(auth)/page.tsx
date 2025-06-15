import { getAdminConfig } from "@/(backend)/services/admin.service.serve";
import TermDepositDashboard from "../__components__/home/dashboard";

export default async function Home() {

    const { valid, data } = await getAdminConfig();

    if (!valid) return null;

    return (
        <TermDepositDashboard homePopupImage={data?.HomePopImage} />
    );
}
