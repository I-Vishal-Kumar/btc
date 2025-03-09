"use client"
import { ArrowRightAlt, GroupOutlined, LocalPrintshopOutlined, SupportAgent } from "@mui/icons-material";
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, SxProps, Typography } from "@mui/material";
import { History as HistoryIcon, Logout } from "@mui/icons-material";
import { ReactNode } from "react";
import { SectionsAvailable } from "@/__types__/ui_types/profil.types";
import { useRouter } from "next/navigation";
import { Router } from "next/router";

type ButtonType = {
    key: SectionsAvailable,
    sx?: SxProps,
    startIcon: ReactNode,
    endIcon?: ReactNode,
    label: string,
    onClick?: (router: Router) => void,
}

type Sections = Record<string, ButtonType[]>

const sections: Sections = {
    'History': [
        {
            key: SectionsAvailable.RECHARGE_HISTORY,
            startIcon: <HistoryIcon />,
            label: "Recharge History",
        },
        {
            key: SectionsAvailable.WITHDRAWAL_HISTORY,
            startIcon: <HistoryIcon />,
            label: "Withdrawal History",
        },
    ],
    'Preference': [
        {
            key: SectionsAvailable.WITHDRAWAL_FUNDS,
            startIcon: <LocalPrintshopOutlined />,
            label: "Withdrawal Funds",
        },
        {
            key: SectionsAvailable.TEAM_COMMISSION,
            startIcon: <GroupOutlined />,
            label: "Team Commission",
        },
        {
            key: SectionsAvailable.SUPPORT,
            startIcon: <SupportAgent />,
            label: "Support",
        },
        {
            key: SectionsAvailable.LOGOUT,
            startIcon: <Logout />,
            label: "Log Out",
            sx: { color: 'red' },
            onClick: (router) => { router.push("/getting-started?type=login") }
        },
    ]
}

export const NavigationSection: React.FC = () => {
    return (
        <div className="w-full mt-5">
            {
                Object.entries(sections).map(([title, childButtons]) => (
                    <CustomList title={title} key={title} childButtons={childButtons} />
                ))
            }
        </div>
    )
}

const CustomList = (
    { title, childButtons }:
        {
            title: string,
            childButtons: ButtonType[]
        }
) => {

    const router = useRouter();

    return (
        <Box sx={{ width: "100%", bgcolor: "background.paper", borderRadius: 2, p: 1 }}>
            <Typography variant="caption" sx={{ pl: 2, color: "text.secondary", fontWeight: 500, fontSize: 14 }}>
                {title}
            </Typography>
            <List sx={{ outline: 1, outlineColor: '#d6d6d6', borderRadius: 3, bgcolor: '#f9f9f9' }}>
                {childButtons.map((item, index) => (
                    <ListItem
                        // @ts-expect-error since on click can be undefined its safer to check it but our data is hard coded.
                        onClick={item?.onClick ? () => item.onClick(router) : () => {
                            router.push(`profile/${ item.key }`)
                        }}
                        sx={{ ...item?.sx }}
                        secondaryAction={
                            item?.endIcon ? item.endIcon : <ArrowRightAlt color="disabled" />
                        }
                        key={index} disablePadding>
                        <ListItemButton sx={{ borderRadius: 2 }}>
                            {item.startIcon && <ListItemIcon sx={item?.sx ? { ...item.sx } : { color: 'black' }}>{item.startIcon}</ListItemIcon>}
                            <ListItemText primary={item.label} />
                        </ListItemButton>

                    </ListItem>
                ))}
            </List>

        </Box>
    );
};
