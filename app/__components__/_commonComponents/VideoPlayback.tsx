"use client"

import { getWatchBonus } from "@/(backend)/services/user.service.serv";
import { USER_CONTEXT } from "@/lib/hooks/user.context";
import { Modal } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useRef, useState } from "react";
import YouTube, { YouTubeEvent } from 'react-youtube';

export function VideoPlayback({
    open,
    id,
    videoSource,
    duration = 30,
    onFinish
}: {
    open: boolean;
    id: string;
    videoSource: string;
    duration: number; // seconds
    onFinish: VoidFunction
}) {

    const playerRef = useRef<YouTube>(null);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);
    const [remaining, setRemaining] = useState(Number(duration));
    const { setUserInfo } = useContext(USER_CONTEXT);

    const { mutate } = useMutation({
        mutationFn: getWatchBonus,
        onSuccess: (data) => {
            enqueueSnackbar(data.msg || 'done', { variant: data.valid ? 'success' : 'error' });
            if (data.valid) {
                setUserInfo(prev => ({
                    ...prev,
                    Balance: prev.Balance + Number(data.data?.reward)
                }))
            }
        }
    })

    const clearCountdown = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    };
    const onReady = (event: any) => {
        const player = event.target;
        playerRef.current = player;

        // Try to play (sometimes needed due to autoplay policy)
        // player.mute(); // ensures autoplay works
        player.playVideo();

        // Stop after X seconds
        setTimeout(() => {
            player.stopVideo();
            mutate(id);
            onFinish()
        }, duration * 1000);
    };

    const startCountdown = () => {
        if (countdownRef.current) return; // Prevent multiple intervals

        countdownRef.current = setInterval(() => {
            setRemaining(prev => {
                if (prev <= 1) {
                    clearCountdown();
                    mutate(id);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };
    const onStateChange = (event: YouTubeEvent<number>) => {
        const state = event.data;
        if (state === 1) {
            // Playing
            startCountdown();
        } else if (state === 2 || state === 0 || state === 3 || state === 5) {
            // Paused, Ended, Buffering, Cued
            event.target.playVideo();
            clearCountdown();
        }
    };
    const opts = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            rel: 0,
            fs: 0,
        },
    };

    useEffect(() => {
        setRemaining(duration); // Reset on open
        if (!open) {
            clearCountdown();
        }

        return () => clearCountdown();
    }, [open, duration]);

    return (
        <Modal open={open} onClose={() => { }} sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="bg-slate-50 relative aspect-[16/9] w-full max-w-3xl rounded-md overflow-hidden">
                <YouTube
                    className="h-full w-full"
                    videoId={videoSource}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-3 py-1 text-xs rounded">
                    {remaining}s left
                </div>
            </div>
        </Modal>
    );
}