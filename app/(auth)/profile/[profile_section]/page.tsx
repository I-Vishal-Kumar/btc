import { SectionsAvailable, WithdrawmethodTabsType } from "@/__types__/ui_types/profil.types";
import { IncomeHistory } from "@/app/__components__/profile/Sections/IncomeHistorySection";
import { RechargeHistory } from "@/app/__components__/profile/Sections/RechargeHistory";
import { SectionWrapper } from "@/app/__components__/profile/Sections/SectionWrapper";
import { Support } from "@/app/__components__/profile/Sections/Support";
import { TeamCommission } from "@/app/__components__/profile/Sections/TeamCommission";
import { WithdrawalFunds } from "@/app/__components__/profile/Sections/WithdrawalFunds";
import { WithdrawalHistory } from "@/app/__components__/profile/Sections/WithdrawalHistory";

type SectionComponentMapping = Partial<Record<SectionsAvailable, React.FC<any>>>;

type props = {
    params: Promise<{ profile_section: SectionsAvailable }>
    searchParams: Promise<{ activeTab: WithdrawmethodTabsType }>
}

export default async function ProfileSections({ searchParams, params }: props) {

    const { profile_section } = await params;
    const { activeTab } = await searchParams;

    const sectionMapping: SectionComponentMapping = {
        [SectionsAvailable.RECHARGE_HISTORY]: RechargeHistory,
        [SectionsAvailable.WITHDRAWAL_HISTORY]: WithdrawalHistory,
        [SectionsAvailable.WITHDRAWAL_FUNDS]: WithdrawalFunds,
        [SectionsAvailable.TEAM_COMMISSION]: TeamCommission,
        [SectionsAvailable.INCOME]: IncomeHistory,
        [SectionsAvailable.SUPPORT]: Support
    };

    const Section = sectionMapping[profile_section];

    return (
        <SectionWrapper title={profile_section}>
            {Section ? (
                <Section {...(profile_section === SectionsAvailable.WITHDRAWAL_FUNDS && { activeTab })} />
            ) : (
                <div>Section Not Found</div>
            )}
        </SectionWrapper>
    );

}
