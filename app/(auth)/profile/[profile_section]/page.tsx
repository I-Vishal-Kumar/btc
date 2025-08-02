import { SectionsAvailable, WithdrawmethodTabsType } from "@/__types__/ui_types/profil.types";
import { IncomeHistory } from "@/app/__components__/profile/Sections/IncomeHistorySection";
import { MyVideos } from "@/app/__components__/profile/Sections/MyVideos";
import { RechargeHistory } from "@/app/__components__/profile/Sections/RechargeHistory";
import { SectionWrapper } from "@/app/__components__/profile/Sections/SectionWrapper";
import { Support } from "@/app/__components__/profile/Sections/Support";
import { TeamCommission } from "@/app/__components__/profile/Sections/TeamCommission";
import { UploadContent } from "@/app/__components__/profile/Sections/UploadContent";
import { VideoEarnings } from "@/app/__components__/profile/Sections/VideoEarnings";
import { WatchToEarn } from "@/app/__components__/profile/Sections/WatchToEarn";
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
        [SectionsAvailable.SUPPORT]: Support,
        [SectionsAvailable.UPLOAD_CONTENT]: UploadContent,
        [SectionsAvailable.MY_VIDEOS]: MyVideos,
        [SectionsAvailable.VIDEO_EARNINGS]: VideoEarnings,
        [SectionsAvailable.WATCH_TO_EARN]: WatchToEarn
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
