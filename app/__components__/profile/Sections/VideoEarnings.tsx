import { getMyVideoEarnings } from "@/(backend)/services/user.service.serv"
import { EarningType, VideoEarningType } from "@/__types__/db.types";
import { formatDate } from "@/lib/helpers/formatDate";
import LineClamp from "@/lib/helpers/lineClamper";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { Chip } from "@mui/material";
import Link from "next/link";


export const VideoEarnings: React.FC = async () => {
    const myEarnings = await getMyVideoEarnings();

    if (!myEarnings.valid) return <div className="p-5 text-red-600">Failed to fetch earnings.</div>;
    if (!myEarnings.data?.length) return <div className="p-5 text-gray-500">No videos uploaded yet.</div>;

    return (
        <div className="flex flex-col gap-y-4 p-5">
            <h2 className="text-xl font-semibold mb-2">My Video Earnings</h2>
            {myEarnings.data.map((detail: EarningType) => (
                <VideoEarningCard key={detail._id} detail={detail} />
            ))}
        </div>
    );
};

function VideoEarningCard({ detail }: { detail: EarningType }) {

    const statusColor = {
        [VideoEarningType.UPLOAD]: '#7f8e1f80',
        [VideoEarningType.WATCH]: '#24bb5280'
    }

    return (
        <div className="p-4 rounded-md ring-1 bg-gray-100 ring-gray-300 space-y-2">
            <div className="flex justify-between items-center">
                <p className="text-xs font-semibold text-gray-700">Video</p>
                <p className="text-[10px] text-gray-500 font-semibold">
                    {formatDate(detail.createdAt, 'd MMM, yyyy HH:mm a')}
                </p>
            </div>

            <div className="flex justify-between items-center mt-1">
                <div className="max-w-[60%]">
                    <div className="text-sm flex items-center space-x-1">
                        <span className="whitespace-nowrap">Source -</span>
                        <LineClamp maxLines={1}>
                            <Link className="text-blue-700" href={detail.VideoSource}>
                                {detail.VideoSource}
                            </Link>
                        </LineClamp>
                    </div>
                </div>

                <Chip
                    label={detail.Type}
                    size="small"
                    sx={{
                        bgcolor: statusColor[detail.Type],
                        color: 'white',
                        fontWeight: 600,
                        fontSize: 9,
                        letterSpacing: 1,
                    }}
                />
            </div>

            <div className="text-sm font-bold text-green-700">
                ₹ {formatNumber(detail.Amount)}
            </div>
        </div>
    );
}
