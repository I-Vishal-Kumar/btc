"use client"

import { Button } from "@mui/material";

export default function Maintainance() {
    return (
        <div className='flex justify-center flex-col text-center items-center h-screen w-screen font-bold text-green-400 text-lg font-serif'>
            Website is currently under Maintainance...<br />
            +91 6391941192
            <Button
                onClick={() => window.open("https://t.me/+sfylQoeCd7I1Y2Nl")?.focus()}
                fullWidth
                sx={{
                    background: 'linear-gradient(to right, #00C851, #FFEB3B)', // green to yellow
                    color: 'white',
                    textTransform: 'none',
                    borderRadius: '999px',
                    py: 1.5,
                    mt: 4,
                    fontWeight: 600,
                    fontSize: '1rem',
                    '&:hover': {
                        background: 'linear-gradient(to right, #00B64A, #FFE600)',
                    }
                }}>
                WhatsApp Group
            </Button>
        </div>
    )
}
