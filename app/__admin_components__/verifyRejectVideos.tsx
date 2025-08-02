"use client"

import { ad_getPeningVideoApproval, ad_videoRejectApprove } from "@/(backend)/services/admin.service.serve"
import { VideoType } from "@/__types__/user.types";
import { formatDate } from "@/lib/helpers/formatDate";
import { Typography, RadioGroup, FormControlLabel, Radio, TextField, Button } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

export const VerifyRejectVideos: React.FC = () => {

    const { isPending, data } = useQuery({
        queryFn: ad_getPeningVideoApproval,
        queryKey: ['PendingVideoApproval']
    });
    if (isPending) return (
        <div>
            Loading...
        </div>
    )

    if (!data?.valid) return <h1>Error.</h1>

    return (
        <div>
            <Typography textAlign={'center'} variant="h2" my={2}>Approve OR reject videos</Typography>
            {
                !data.data?.length ? (
                    <h1>No videos pending for approval</h1>
                ) : null
            }
            <div className="space-y-6 p-5">
                {data?.data?.map((video) => (
                    <VideoCard key={video._id} video={video} />
                ))}
            </div>
        </div>
    )
}

function extractYouTubeID(url: string) {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^"&?/ ]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function VideoCard({ video }: { video: VideoType }) {
    const [action, setAction] = useState('');
    const [reward, setReward] = useState('');
    const [duration, setDuration] = useState('');

    const videoId = extractYouTubeID(video.VideoSource);
    const isYT = !!videoId;

    const { isPending, data, isSuccess, mutate } = useMutation({
        mutationFn: ad_videoRejectApprove,
        mutationKey: ['VideoStatusChange'],
    });

    const handleSubmit = () => {
        if (action === 'approve' && (!reward || !duration)) return;

        mutate({
            id: video._id,
            operation: action === 'approve' ? 'APPROVED' : 'REJECTED',
            durationInSec: parseFloat(duration),
            rewardAmount: parseFloat(reward),
        });
    };

    if (isSuccess) {
        enqueueSnackbar(data?.msg || 'done', { variant: data.valid ? 'success' : 'error' })
    }

    return (
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
            <Typography fontSize={16} fontWeight={700}>
                Uploaded on {formatDate(new Date(video.createdAt), 'd MMM yyyy, HH:mm a')}
            </Typography>

            {isYT && videoId ? (
                <div className="aspect-video w-full rounded overflow-hidden border border-gray-200">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${ videoId }`}
                        title="YouTube video"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                </div>
            ) : (
                <div className="bg-gray-100 p-3 rounded text-sm">
                    Not a YouTube video.{" "}
                    <a href={video.VideoSource} className="text-blue-600 underline" target="_blank">
                        Open Source
                    </a>
                </div>
            )}

            <div className="text-sm grid grid-cols-2 gap-x-6 gap-y-2">
                <p><strong>Phone:</strong> {video.PhoneNumber}</p>
                <p><strong>Invitation:</strong> {video.InvitationCode}</p>
                <p><strong>Status:</strong> {video.ApprovalStatus}</p>
            </div>

            <RadioGroup
                row
                value={action}
                onChange={(e) => setAction(e.target.value)}
            >
                <FormControlLabel value="approve" control={<Radio />} label="Approve" />
                <FormControlLabel value="reject" control={<Radio />} label="Reject" />
            </RadioGroup>

            {action === 'approve' && (
                <div className="flex flex-col sm:flex-row gap-4">
                    <TextField
                        label="Reward Amount (₹)"
                        type="number"
                        size="small"
                        value={reward}
                        required
                        onChange={(e) => setReward(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Duration (sec)"
                        type="number"
                        size="small"
                        value={duration}
                        required
                        onChange={(e) => setDuration(e.target.value)}
                        fullWidth
                    />
                </div>
            )}

            <div className="flex justify-end">
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    disabled={action === '' || (action === 'approve' && (!reward || !duration))}
                >
                    {isPending ? 'Submitting...' : 'Submit Decision'}
                </Button>
            </div>
        </div>
    );
}
