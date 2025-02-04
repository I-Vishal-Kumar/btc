"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, History, Person } from "@mui/icons-material";
import { motion } from "framer-motion";

const Footer = () => {
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { label: "Home", icon: <Home />, path: "/" },
        { label: "Trade History", icon: <History />, path: "/history" },
        { label: "Profile", icon: <Person />, path: "/profile" },
    ];

    return (
        <footer className="w-full bg-white shadow-md border-t p-3">
            <nav className="flex justify-around items-center">
                {navItems.map(({ label, icon, path }) => (
                    <motion.button
                        key={label}
                        onClick={() => router.push(path)}
                        className={`flex flex-col items-center transition-colors duration-300 ${ pathname === path ? "text-cyan-400" : "text-gray-500"
                            }`}
                        whileTap={{ scale: 0.9 }} // Subtle click animation
                        whileHover={{ y: -2 }} // Slight hover lift
                    >
                        {icon}
                        <span className="text-xs">{label}</span>
                    </motion.button>
                ))}
            </nav>
        </footer>
    );
};

export default Footer;
