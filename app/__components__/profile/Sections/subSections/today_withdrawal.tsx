import { ActiveTabs } from "@/__types__/ui_types/profil.types"

export const TodayWithdrawal: React.FC<{ activeTab: ActiveTabs }> = ({ activeTab }) => {
    return (
        <div>
            {activeTab}
        </div>
    )
} 