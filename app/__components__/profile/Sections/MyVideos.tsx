import { getMyVideos } from "@/(backend)/services/user.service.serv"
import { VideoApprovalStatusType } from "@/__types__/db.types";
import { VideoType } from "@/__types__/user.types";
import { formatDate } from "@/lib/helpers/formatDate";
import LineClamp from "@/lib/helpers/lineClamper";
import { formatNumber } from "@/lib/helpers/numberFormatter";
import { Typography, Chip } from "@mui/material";
import Link from "next/link";

export const MyVideos: React.FC = async () => {

    const myVideos = await getMyVideos();

    if (!myVideos.valid) return <>Failed..</>
    if (!myVideos.data?.length) return <>No Videos uploaded yet.</>

    return (
        <div className="flex flex-col gap-y-4 p-5">
            {
                myVideos.data.map(videoDetail => (
                    <VideoCard detail={videoDetail} key={videoDetail._id} />
                ))
            }
        </div>
    )
}


function VideoCard({ detail }: { detail: VideoType }) {

    const Color = {
        [VideoApprovalStatusType.APPROVED]: '#51ff97',
        [VideoApprovalStatusType.PENDING_APPROVAL]: '#ffd04b',
        [VideoApprovalStatusType.REJECTED]: '#ff5c4b'
    }

    return (
        <div className="p-4 rounded-md ring-1 bg-gray-100 ring-gray-300">
            <Typography variant="caption" fontWeight={600} fontSize={12}>Video</Typography>
            <div className="flex justify-between items-center">
                <Typography fontSize={10} fontWeight={600} color="textDisabled">
                    {formatDate(detail.createdAt, "d MMM, yyyy HH:mm a")}
                </Typography>
                {
                    detail.ApprovalStatus === VideoApprovalStatusType.APPROVED ? (
                        <Typography fontWeight={500} fontSize={12}>
                            {formatNumber(detail.VideoUploadEarning)}
                        </Typography>
                    ) : null
                }
            </div>
            <div className="flex justify-between items-center mt-2">
                <div className=" max-w-[60%] overflow-clip">
                    <div className=" text-sm flex justify-center items-center">
                        <span className="whitespace-nowrap">
                            Video Source -
                        </span>
                        <LineClamp maxLines={1}>
                            <Link className="text-blue-700" href={detail.VideoSource} >{detail.VideoSource}</Link>
                        </LineClamp>
                    </div>
                </div>
                <Chip label={detail.ApprovalStatus} size={"small"} sx={{ bgcolor: Color[detail.ApprovalStatus], letterSpacing: 1, color: 'white', fontWeight: 600, fontSize: 9 }} />
            </div>
        </div>
    )
}