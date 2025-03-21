import { Box } from "@mui/material"
import Image from "next/image";


const services = [
    {
        title: "TUNNELS, BORES & DRILLING",
        description:
            "Trenchless utility installation via auger bores, tunnel boring machines, microtunnels, pipebursting and sliplining have always been a part of our repertoire at BTC. Our trenchless division,",
        linkText: "BTrenchless",
        linkHref: "#",
    },
    {
        title: "HYDROVAC EXCAVATION",
        description:
            "Hydrovac Excavation provides a non-destructive, cost-effective, and accurate process to safely locate underground utilities. Used to remove both wet and dry materials, making it a versatile process for a variety of applications.",
        linkText: "Hydrovac Excavation",
        linkHref: "#",
    },
    {
        title: "ELECTRICAL DUCT BANKS",
        description:
            "Underground electrical transmission and communication duct banks contribute to BTC's diverse resume of utility infrastructure installation experience.",
    },
];


const Home: React.FC = () => {
    return (
        <Box>
            <nav className="bg-gray-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        <div className="flex-shrink-0">
                            <img src="/getting-started/logo_full.png" alt="BTC Logo" className="h-12 w-auto" />
                        </div>

                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-6">
                                <a href="#" className="text-red-400 font-semibold border-b-2 border-red-400 px-3 py-2">Home</a>
                                <a href="#" className="hover:text-gray-300">About</a>
                                <a href="#" className="hover:text-gray-300">Services</a>
                                <a href="#" className="hover:text-gray-300">Projects</a>
                                <a href="#" className="hover:text-gray-300">Careers</a>
                                <a href="#" className="hover:text-gray-300">Contact</a>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <header className="relative w-full h-[80vh]">
                <div className="absolute inset-0 bg-black bg-opacity-50">
                    <Image src={'/assets/recharge_bg.jpg'} objectFit="cover" fill alt="bg" />
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">BUILDING INFRASTRUCTURE <br /> FOR A BETTER LIFE</h1>
                </div>
            </header>
            <main>
                <div className="bg-gray-100 py-12 px-4">
                    <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 shadow-md rounded-md hover:shadow-lg transition duration-300"
                            >
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                                <p className="text-gray-600">
                                    {service.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <footer className="bg-gray-900 text-white py-6">
                <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
                    {/* Left Section - Company Name */}
                    <div className="text-center md:text-left">
                        <h2 className="text-xl font-bold">BTC Contractors</h2>
                        <p className="text-gray-400 text-sm">Building Infrastructure for a Better Life</p>
                    </div>

                    {/* Middle Section - Contact Details */}
                    <div className="text-center mt-4 md:mt-0">
                        <p className="text-gray-300">

                            <a href="/terms-condition" className="text-blue-400 hover:underline">
                                Terms & conditaion:
                            </a>
                        </p>
                        <p className="text-gray-300">
                            📧 Email:
                            <a href="mailto:info@btc.com" className="text-blue-400 hover:underline">
                                btcdeveloper37@gmail.com
                            </a>
                        </p>
                        <p className="text-gray-300">
                            📞 Phone:
                            <a href="tel:+1234567890" className="text-blue-400 hover:underline">
                                +91 87579 93223
                            </a>
                        </p>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="text-center text-gray-500 text-sm mt-4">
                    &copy; {new Date().getFullYear()} BTC Contractors. All Rights Reserved.
                </div>
            </footer>
        </Box>
    )
}

export default Home;