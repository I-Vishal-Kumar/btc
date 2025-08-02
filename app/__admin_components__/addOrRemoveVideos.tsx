"use client"

import { ad_getAllApprovedVideos, ad_toggleVideoVisibility } from "@/(backend)/services/admin.service.serve"
import { VideoVissibilityStatusType } from "@/__types__/db.types";
import { VideoType } from "@/__types__/user.types";
import { Typography, FormControlLabel, TextField, Chip, Switch } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query"
import { enqueueSnackbar } from "notistack";
import { useState } from "react";

function extractYouTubeID(url: string) {
    const regex = /(?:youtube\.com\/.*v=|youtu\.be\/)([^"&?/ ]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

export const AddOrRemoveVideos: React.FC = () => {
    const { isPending, data } = useQuery({
        queryFn: ad_getAllApprovedVideos,
        queryKey: ["PendingVideoApproval"],
    });

    const [searchQuery, setSearchQuery] = useState("");

    if (isPending)
        return (
            <div>
                <Typography textAlign="center">Loading...</Typography>
            </div>
        );

    if (!data?.valid) return <h1>Error.</h1>;

    const filteredVideos = data.data?.filter((video: VideoType) =>
        video.PhoneNumber.toLowerCase().includes(searchQuery.trim().toLowerCase())
    );

    return (
        <div>
            <Typography textAlign={"center"} variant="h4" my={2}>
                Add Or Remove Videos
            </Typography>

            <div className="px-4 pb-4">
                <TextField
                    fullWidth
                    size="small"
                    label="Search by Phone Number"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {!filteredVideos?.length ? (
                <Typography textAlign="center" mt={4}>
                    No videos found
                </Typography>
            ) : (
                <div className="space-y-6 p-5">
                    {filteredVideos.map((video: VideoType) => (
                        <Card video={video} key={video._id} />
                    ))}
                </div>
            )}
        </div>
    );
};

export function Card({ video }: { video: VideoType }) {
    const [isVissible, setVissible] = useState(
        video.Vissibility === VideoVissibilityStatusType.VISSIBLE
    );

    const toggleVisibilityMutation = useMutation({
        mutationFn: ad_toggleVideoVisibility,
        onSuccess: (isSuccess: boolean) => {
            enqueueSnackbar(
                isSuccess ? "Visibility updated successfully" : "Something went wrong",
                { variant: isSuccess ? "success" : "error" }
            );
            if (isSuccess) {
                setVissible((prev) => !prev);
            }
        },
    });

    const handleToggle = () => {
        const newStatus = isVissible
            ? VideoVissibilityStatusType.BUCKET
            : VideoVissibilityStatusType.VISSIBLE;
        toggleVisibilityMutation.mutate({ id: video._id, newStatus });
    };

    const videoId = extractYouTubeID(video.VideoSource);
    const isYT = !!videoId;

    return (
        <div className="p-4 rounded-md border shadow bg-white flex flex-col gap-4">
            {/* Header Info */}
            <div className="flex flex-col gap-1">
                <Typography fontWeight={600} fontSize={14}>
                    Uploaded: {new Date(video.createdAt).toLocaleString()}
                </Typography>
                <Typography fontSize={13}>
                    <strong>Phone:</strong> {video.PhoneNumber}
                </Typography>
                <Typography fontSize={13}>
                    <strong>Reward:</strong> ₹{video.VideoUploadEarning}
                </Typography>
            </div>

            {/* Video Player */}
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
                    <a
                        href={video.VideoSource}
                        className="text-blue-600 underline"
                        target="_blank"
                    >
                        Open Source
                    </a>
                </div>
            )}

            {/* Footer with Status and Switch */}
            <div className="flex justify-between items-center">
                <Chip
                    label={isVissible ? "Visible" : "Hidden"}
                    color={isVissible ? "success" : "default"}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                />

                <FormControlLabel
                    control={
                        <Switch
                            color="primary"
                            checked={isVissible}
                            onChange={handleToggle}
                            disabled={toggleVisibilityMutation.isPending}
                        />
                    }
                    label={isVissible ? "Visible" : "Hidden"}
                />
            </div>
        </div>
    );
}
