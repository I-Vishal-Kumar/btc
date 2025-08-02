"use client"

import { uploadVideoForApproval } from "@/(backend)/services/user.service.serv"
import { CheckCircle, YouTube } from "@mui/icons-material"
import { CardHeader, List, ListItem, TextField, Typography } from "@mui/material"
import { useMutation } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack"
import { useState } from "react"

export const UploadContent: React.FC = () => {

    const [videoSrc, setVideoSrc] = useState<string>('');

    const { mutate, isPending } = useMutation({
        mutationFn: uploadVideoForApproval,
        onSuccess: (data) => {
            enqueueSnackbar(data.msg, { variant: data.valid ? 'success' : 'error' })
        }
    })

    return (
        <div className=" h-full w-full bg-gradient-to-b pb-20 from-[#ed5cd2] to-[#5c87f9] flex flex-col gap-y-4 p-5">
            <div>
                <Typography variant="h1" sx={{ lineHeight: 1 }} color="white">
                    Share Your YouTube Link
                </Typography>
                <Typography variant="h1" color="white">
                    & Start Earning
                </Typography>
                <Typography variant="h1" sx={{ lineHeight: 1 }} color="white">
                    Instantly!
                </Typography>
                <Typography fontWeight={400} fontSize={12} sx={{ mt: 1, maxWidth: '80%' }} color="white">
                    Paste any BTC India YouTube video link and receive instant rewards when it&apos;s approved
                </Typography>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                <div className="flex gap-x-3">
                    <TextField
                        value={videoSrc}
                        onChange={e => setVideoSrc(e.target.value)}
                        slotProps={{
                            input: { startAdornment: <YouTube fontSize={"large"} color="error" /> },
                            htmlInput: {
                                style: {
                                    fontSize: 12,
                                    paddingLeft: '0.5rem'
                                }
                            }
                        }}
                        sx={{ flex: 1, bgcolor: '#e9e9e9', overflow: 'hidden', borderRadius: 3, '& fieldset': { display: 'none' } }} placeholder="Paste Your Youtube Video Link" />
                    <button disabled={isPending} onClick={() => {
                        if (!videoSrc) {
                            enqueueSnackbar("Enter a link first", { variant: 'warning' });
                            return;
                        }
                        mutate(videoSrc)
                    }} className="rounded-xl py-1 flex-[0.3] px-3 bg-[#79dcfd] text-white text-[0.7rem] font-semibold flex items-center hover:bg-cyan-600 transition">
                        {isPending ? "Uploading..." : "Check And Submit"}
                    </button>
                </div>
                <Typography fontSize={10} mt={1}>
                    Only Public Videos And BTC India Related Videos are Allowed.
                </Typography>
            </div>

            <div className="grid grid-cols-5 gap-4">
                <div className=" p-3 col-span-3 rounded-2xl bg-slate-50">
                    <CardHeader
                        sx={{ p: 0 }}
                        avatar={<div className="h-[4rem] w-[4rem] rounded-md bg-red-300">

                        </div>}
                        title={'Sample Video'}
                        subheader={<div>
                            <Typography sx={{ fontSize: 10 }}>4:30</Typography>
                            <div className="flex gap-1 text-[#69e6aa] mt-2 text-[0.5rem]">
                                <CheckCircle sx={{ fontSize: 12, color: 'gray' }} />
                                Video eligible
                            </div>
                        </div>}
                        slotProps={{
                            title: { fontSize: 12, fontWeight: 700 }
                        }}
                    />
                    <Typography sx={{ fontSize: 10, fontWeight: 500, mt: 2 }}>
                        Estimated Reward:
                    </Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                        INR 0 - 100.00
                    </Typography>
                </div>
                <div className="rounded-2xl  p-3 col-span-2 space-y-1 bg-slate-50">
                    <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Reward summary</Typography>
                    <div className="flex mt-1 items-center gap-x-2">
                        <div className="p-1 px-2 bg-yellow-200 rounded-md">
                            <Typography>X</Typography>
                        </div>
                        <Typography fontSize={10}>Video Engagement</Typography>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <div className="p-1 px-2 bg-yellow-200 rounded-md">
                            <Typography>X</Typography>
                        </div>
                        <Typography fontSize={10}>Estimated Income</Typography>
                    </div>
                    <div className="flex items-center gap-x-2">
                        <div className="p-1 px-2 bg-yellow-200 rounded-md">
                            <Typography>X</Typography>
                        </div>
                        <Typography fontSize={10}>Referral Bonus</Typography>
                    </div>
                </div>
                <div className=" p-3 rounded-2xl col-span-5 bg-slate-50">
                    <Typography fontSize={12} fontWeight={600}>Rules and Tips</Typography>
                    <List sx={{ fontSize: 12, pl: 2, mt: 1, listStyleType: 'disc' }} disablePadding>
                        {[
                            "Submit only public YouTube videos",
                            "Follow YouTube content rules",
                            "Prefer longer and engaging videos",
                            "Use your referral code for bonus",
                            "No private or duplicate links",
                            "No copyrighted or fake content",
                            "No misleading or adult video",
                        ].map((text, i) => (
                            <ListItem key={i} sx={{ display: 'list-item', pl: 0, py: 0 }}>
                                {text}
                            </ListItem>
                        ))}
                    </List>

                </div>
            </div>
        </div>
    )
}
