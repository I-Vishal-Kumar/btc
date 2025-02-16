import Skeleton from "@mui/material/Skeleton";
import { AnimatePresence, motion } from "framer-motion";

const SkeletonDashboard = () => {
    return (
        <AnimatePresence mode="wait" >

            <motion.div
                initial={{ opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0, transition: { duration: 3, ease: 'easeInOut' } }}// Fades out and slides down
                transition={{ duration: 3, ease: "easeInOut" }} // Smooth transition
                className=" p-4 relative space-y-4 bg-white overflow-hidden h-[100dvh] w-[100dvw]">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Skeleton animation="wave" variant="text" width={180} height={24} />
                    <Skeleton animation="wave" variant="rounded" width={100} height={35} />
                </div>

                {/* Red Box (Placeholder) */}
                <Skeleton animation="wave" variant="rounded" width="100%" height={120} className="rounded-lg" />

                {/* Quick Access */}
                <div className="p-3 rounded-lg shadow-md space-y-2">
                    <Skeleton animation="wave" variant="text" width={100} height={20} />
                    <div className="flex justify-around">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton animation="wave" key={index} variant="circular" width={40} height={40} />
                        ))}
                    </div>
                    <Skeleton animation="wave" variant="rounded" width="80%" height={30} />
                </div>

                {/* Create Term Deposit */}
                <div className="p-3 rounded-lg shadow-md space-y-3">
                    <Skeleton animation="wave" variant="text" width="50%" height={20} />
                    <Skeleton animation="wave" variant="rounded" width="100%" height={40} />
                    <div className="flex justify-between">
                        <Skeleton animation="wave" variant="text" width={50} height={20} />
                        <Skeleton animation="wave" variant="text" width={50} height={20} />
                    </div>
                    <Skeleton animation="wave" variant="rounded" width="100%" height={6} />
                    <Skeleton animation="wave" variant="rounded" width="100%" height={40} />
                    <Skeleton animation="wave" variant="rounded" width="100%" height={50} />
                </div>

                {/* Bottom Navigation */}
                <div className="flex justify-around absolute w-full bottom-2 p-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <Skeleton animation="wave" key={index} variant="circular" width={40} height={40} />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>

    );
};

export default SkeletonDashboard;
