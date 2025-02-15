import { ActiveTabs } from "@/__types__/ui_types/profil.types"
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