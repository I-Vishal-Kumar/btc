"use server"
import { ActiveTabs, SubSectionsAvailable } from "@/__types__/ui_types/profil.types";
import { Header } from "@/app/__components__/header/Header";
import { DirectMembers } from "@/app/__components__/profile/Sections/subSections/direct_members";
import { TodayDeposit } from "@/app/__components__/profile/Sections/subSections/today_deposit";
import { TodayRegistration } from "@/app/__components__/profile/Sections/subSections/today_registration";
import { TodayWithdrawal } from "@/app/__components__/profile/Sections/subSections/today_withdrawal";
import { Toggler } from "@/app/__components__/profile/Sections/subSections/togle_tabs";
import { Container } from "@mui/material";

type ChildSectionProps = {
    params: Promise<{ child_section: SubSectionsAvailable }>,
    searchParams: Promise<{ activeTab: ActiveTabs }>
}


export default async function ChildSections({ searchParams, params }: ChildSectionProps) {

    const { child_section } = await params;
    const { activeTab } = await searchParams;

    const ActiveSection = (
        {
            [SubSectionsAvailable.TODAY_DEPOSIT]: TodayDeposit,
            [SubSectionsAvailable.TODAY_WITHDRAWAL]: TodayWithdrawal,
            [SubSectionsAvailable.TODAY_REGISTRATION]: TodayRegistration,
            [SubSectionsAvailable.DIRECT_MEMBERS]: DirectMembers
        }
    )[child_section]
    // const initialData = await getUserDetails();
    return (
        <Container disableGutters>
            <Header title={child_section} />
            <Toggler tab={activeTab} />

            <ActiveSection activeTab={activeTab} />

        </Container>
    )
}