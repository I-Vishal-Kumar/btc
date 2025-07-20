"use client"
import { bookFdProfit } from '@/(backend)/services/fd.services.serv'
import { FdStatus } from '@/__types__/db.types'
import { FD_type } from '@/__types__/fd.types'
import { calculateFDProfit } from '@/lib/helpers/calcFdProfit'
import { formatNumber } from '@/lib/helpers/numberFormatter'
import { Button, Typography } from '@mui/material'
import { DateTime } from 'luxon'
import { enqueueSnackbar } from 'notistack'
import React from 'react'

export default function BookButton({ fd }: { fd: FD_type }) {

    if (fd.Claimed) return null;


    const handleBooking = async () => {

        const proceed = window.confirm("Do you really want to book this fd.");

        if (!proceed) return;

        if (fd.FdStatus === FdStatus.HALTED) {
            enqueueSnackbar("Already booked", { variant: 'warning' });
            return;
        };
        await bookFdProfit({ id: fd._id });
        enqueueSnackbar("Profit booked", { variant: 'success' });
    }

    const maturityOn = DateTime.fromJSDate(new Date(fd.createdAt)).toUTC().plus({ days: Number(fd.FdDuration) }).startOf('day');
    const today = DateTime.fromJSDate(new Date()).startOf('day');
    const LastClaimedOn = DateTime.fromJSDate(new Date(fd.LastClaimedOn)).startOf('day');

    const daysDiff = Math.floor(Math.max(maturityOn.diff(fd.FdStatus === 'HALTED' ? LastClaimedOn : today, 'days').days, 1));

    return (
        <div className='px-5 my-2 mb-4'>
            <div onClick={handleBooking} className="p-[2px] flex justify-center items-center rounded-[1rem] bg-gradient-to-r from-red-500/80 to-orange-400/80">
                <div className="bg-[#fef0e6] flex-1 p-2 rounded-[0.9rem]">
                    <Typography textAlign={'center'} fontSize={12} fontWeight={600}>
                        Remaining Period {daysDiff} Days
                    </Typography>
                    <Typography textAlign={'center'} fontSize={13} fontWeight={600}>
                        Estimated Profit {formatNumber(calculateFDProfit(fd.FdAmount, daysDiff, 2.6))}
                    </Typography>
                    <Button fullWidth sx={{
                        mt: 2, borderRadius: '100vw', textTransform: 'initial',
                        background: 'linear-gradient(to right, #f3c45c,#e43905)'
                    }} variant="contained">
                        {fd.FdStatus === FdStatus.HALTED ? "Booked" : "Book"} Profit On 2.6%
                    </Button>
                </div>
            </div>
        </div>
    )
}
