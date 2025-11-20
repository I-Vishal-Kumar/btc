
"use client"

import { canWatch, getAvailableVideosToWatch } from "@/(backend)/services/user.service.serv";
import { VideoType } from "@/__types__/user.types";
import { Typography, List, ListItem, CardHeader, Divider } from "@mui/material";
import { VideoPlayback } from "../../_commonComponents/VideoPlayback";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Image from "next/image";
import { enqueueSnackbar } from "notistack";


function extractYouTubeID(url: string) {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^"&?/ ]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export const WatchToEarn: React.FC = () => {

    const [playableVideo, setPlayableVideo] = useState<VideoType>();
    const { data: videos, isPending, isSuccess } = useQuery({
        queryFn: getAvailableVideosToWatch,
        queryKey: ['available_videos']
    })
    const { mutateAsync } = useMutation({
        mutationFn: canWatch,
        mutationKey: ['available_videos']
    })
    const handlePlayback = async (video: VideoType | undefined) => {
        if (!videos?.data?.length) return;
        const canWatchResp = await mutateAsync();
        if (!canWatchResp.valid) {
            enqueueSnackbar(canWatchResp.msg || 'Cannot watch now', { variant: 'error' });
            return;
        }
        setPlayableVideo(video);
    }

    if (!isSuccess && !isPending) return <>Loading...</>
    if (!videos?.valid) return <>Failed..</>
    if (!videos.data?.length) return <>No Videos Avialbe.</>
    const videoId = extractYouTubeID(videos.data[0].VideoSource);

    return (
        <div className=" h-full w-full bg-gradient-to-bl pb-20 to-[#ed5cd2] from-[#5c87f9] flex flex-col gap-y-4 p-5">
            <div>
                <Typography variant="h1" sx={{ lineHeight: 1 }} color="white">
                    Watch to Earn
                </Typography>
                <Typography variant="h1" sx={{ lineHeight: 1 }} color="white">
                    Rewards!
                </Typography>
                <Typography fontWeight={400} fontSize={12} sx={{ mt: 1, maxWidth: '80%' }} color="white">
                    Spend just X minutes daily. Get paid for every second you watch.
                </Typography>
            </div>
            <div
                onClick={() => handlePlayback(videos?.data?.[0])}
                className="mt-4 p-1 aspect-[16/9] rounded-2xl bg-slate-50">
                <Image
                    src={`https://img.youtube.com/vi/${ videoId }/hqdefault.jpg`}
                    alt="YouTube video thumbnail"
                    className="w-full h-full aspect-video rounded-xl pointer-events-none"
                    draggable={false}
                    width={100}
                    height={200}
                />
            </div>
            <div className="grid grid-cols-5 gap-4">

                <div className="rounded-2xl p-3 col-span-5 space-y-1 bg-slate-50">
                    <Typography fontSize={12} fontWeight={600}>Most Rewarding</Typography>
                    <List sx={{ maxHeight: '50vh', overflowY: 'auto' }}>
                        {
                            videos.data.map(video => (
                                <ListItem
                                    onClick={() => handlePlayback(video)}
                                    key={video._id} disableGutters>
                                    <VideoDetails video={video} />
                                </ListItem>
                            ))
                        }
                        <Divider>
                            <Typography py={2} textAlign={'center'} variant="subtitle1" color="GrayText">That&apos;s all..</Typography>
                        </Divider>
                    </List>
                </div>
                <div className=" p-3 rounded-2xl col-span-5 bg-slate-50">
                    <Typography fontSize={12} fontWeight={600}>Rules and Tips</Typography>
                    <List sx={{ fontSize: 12, pl: 2, mt: 1, listStyleType: 'disc' }} disablePadding>
                        {[
                            "Watch full video to earn rewards",
                            "Submit only one view per video",
                            "Follow daily watch limit",
                            "Don't refresh to watch for extra income",
                            "No fake engagement or bots",
                            "Don't skip or mute the video",
                            "Choose longer videos for bigger rewards",
                        ].map((text, i) => (
                            <ListItem key={i} sx={{ display: 'list-item', pl: 0, py: 0 }}>
                                {text}.
                            </ListItem>
                        ))}
                    </List>

                </div>
            </div>
            {
                playableVideo ? (
                    <VideoPlayback onFinish={() => {
                        setPlayableVideo(undefined);
                    }} open id={playableVideo._id.toString()} duration={Number(playableVideo.Duration)} videoSource={extractYouTubeID(playableVideo.VideoSource.toString()) || ""} />
                ) : null
            }
        </div>
    )
}

function VideoDetails({ video }: { video: VideoType }) {
    const videoId = extractYouTubeID(video.VideoSource);

    return (
        <CardHeader
            sx={{ p: 0 }}
            avatar={<div className="h-[4rem] aspect-[16/9] rounded-md bg-red-300">
                <Image
                    src={`https://img.youtube.com/vi/${ videoId }/hqdefault.jpg`}
                    alt="YouTube video thumbnail"
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                    width={100}
                    height={200}
                />
            </div>}
            title={'Video'}
            subheader={<div>
                <Typography sx={{ fontSize: 10 }} mt={1}>Estimated Reward For Full Watch:</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 600 }}>INR {video.DailyRates}</Typography>
            </div>}
            slotProps={{
                title: { fontSize: 12, fontWeight: 700 }
            }}
        />
    )
}


