"use client"

import Image from 'next/image';
import React, { useRef } from 'react'

export default function Download() {
    const btcRef = useRef<HTMLAnchorElement>(null);

    const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const clickY = e.clientY;
        const screenHeight = window.innerHeight;

        if (clickY <= screenHeight * 0.25 && btcRef.current) {
            btcRef.current.click();
        }
    };

    return (
        <div
            className='relative h-screen w-full'
            onClick={handleClick}
        >
            <Image
                src={'/assets/download_page_bg.png'}
                fill
                alt='download playstore'
            />
            <a
                ref={btcRef}
                hidden
                href="./BTC-India.apk"
                download={'BTC'}
            />
        </div>
    );
}
