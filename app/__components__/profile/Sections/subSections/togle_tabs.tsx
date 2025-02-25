import { ActiveTabs, WidthdrawMethodTabs, WithdrawmethodTabsType } from "@/__types__/ui_types/profil.types"
import { Box, Tab, Tabs } from "@mui/material"
import Link from "next/link"

export const Toggler: React.FC<{ tab?: 'today' | 'all' }> = ({ tab = 'today' }) => {

    return (
        <Box px={3}>
            <Tabs
                value={tab}
                centered
                sx={{
                    outline: 1,
                    outlineColor: '#d9d9d9',
                    "& .MuiTabs-indicator": { display: "none" }, // Hide the default indicator
                    backgroundColor: "#f5f5f5", // Background for the whole tab container
                    borderRadius: 2, // Optional rounded corners
                }}
            >
                <Tab
                    label="Today"
                    component={Link}
                    href={`?activeTab=${ ActiveTabs.TODAY }`}
                    value={ActiveTabs.TODAY}
                    sx={{
                        flex: 1,
                        backgroundColor: tab === ActiveTabs.TODAY ? "#ddd" : "transparent",
                        color: tab === ActiveTabs.TODAY ? "black" : "black",
                        borderRadius: 1,
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                            backgroundColor: tab === ActiveTabs.TODAY ? "#ccc" : "#eee",
                        },
                    }}
                />
                <Tab
                    label="All"
                    component={Link}
                    href={`?activeTab=${ ActiveTabs.ALL }`}
                    value={ActiveTabs.ALL}
                    sx={{
                        flex: 1,
                        width: '100%',
                        textAlign: 'center',
                        backgroundColor: tab === ActiveTabs.ALL ? "#ddd" : "transparent",
                        color: tab === ActiveTabs.ALL ? "black" : "black",
                        borderRadius: 1,
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                            backgroundColor: tab === ActiveTabs.ALL ? "#ccc" : "#eee",
                        },
                    }}
                />
            </Tabs>
        </Box>
    )
}


export const WithdrawMethodToggler: React.FC<{ tab?: WithdrawmethodTabsType }> = ({ tab = 'local' }) => {

    return (
        <Box px={3}>
            <Tabs
                value={tab}
                centered
                sx={{
                    outline: 1,
                    outlineColor: '#d9d9d9',
                    "& .MuiTabs-indicator": { display: "none" }, // Hide the default indicator
                    backgroundColor: "#f5f5f5", // Background for the whole tab container
                    borderRadius: 2,
                }}
            >
                <Tab
                    label="Local"
                    component={Link}
                    href={`?activeTab=${ WidthdrawMethodTabs.LOCAL }`}
                    value={WidthdrawMethodTabs.LOCAL}
                    sx={{
                        flex: 1,
                        backgroundColor: tab === WidthdrawMethodTabs.LOCAL ? "#ddd" : "transparent",
                        color: tab === WidthdrawMethodTabs.LOCAL ? "black" : "black",
                        borderRadius: 1,
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                            backgroundColor: tab === WidthdrawMethodTabs.LOCAL ? "#ccc" : "#eee",
                        },
                    }}
                />
                <Tab
                    label="USDT"
                    component={Link}
                    href={`?activeTab=${ WidthdrawMethodTabs.USDT }`}
                    value={WidthdrawMethodTabs.USDT}
                    sx={{
                        flex: 1,
                        width: '100%',
                        textAlign: 'center',
                        backgroundColor: tab === WidthdrawMethodTabs.USDT ? "#ddd" : "transparent",
                        color: tab === WidthdrawMethodTabs.USDT ? "black" : "black",
                        borderRadius: 1,
                        transition: "background-color 0.3s ease",
                        "&:hover": {
                            backgroundColor: tab === WidthdrawMethodTabs.USDT ? "#ccc" : "#eee",
                        },
                    }}
                />
            </Tabs>
        </Box>
    )
} 