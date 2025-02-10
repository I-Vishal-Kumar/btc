import { SectionsAvailable } from "@/__types__/ui_types/profil.types";
import { RechargeHistory } from "@/app/__components__/profile/Sections/RechargeHistory";
import { SectionWrapper } from "@/app/__components__/profile/Sections/SectionWrapper";
import { Support } from "@/app/__components__/profile/Sections/Support";
import { TeamCommission } from "@/app/__components__/profile/Sections/TeamCommission";
import { WithdrawalFunds } from "@/app/__components__/profile/Sections/WithdrawalFunds";
import { WithdrawalHistory } from "@/app/__components__/profile/Sections/WithdrawalHistory";

type SectionComponentMapping = Partial<Record<SectionsAvailable, React.FC>>;

export default async function ProfileSections({ params }: { params: { profile_section: SectionsAvailable } }) {

    const { profile_section } = await params;

    const sectionMapping: SectionComponentMapping = {
        [SectionsAvailable.RECHARGE_HISTORY]: RechargeHistory,
        [SectionsAvailable.WITHDRAWAL_HISTORY]: WithdrawalHistory,
        [SectionsAvailable.WITHDRAWAL_FUNDS]: WithdrawalFunds,
        [SectionsAvailable.TEAM_COMMISSION]: TeamCommission,
        [SectionsAvailable.SUPPORT]: Support
    };

    const Section = sectionMapping[profile_section];

    return (
        <SectionWrapper title={profile_section}>
            {Section ? <Section /> : <div>Section Not Found</div>}
        </SectionWrapper>
    );
}
