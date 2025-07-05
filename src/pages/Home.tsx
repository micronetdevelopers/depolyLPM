import React, { useState } from "react";
import {
    BusFront,
    Plane,
    TrainFront,
    Hotel,
    CalendarDays,
    MapPin,
    ArrowRightLeft,
    ChevronRight,
    Navigation,
} from "lucide-react";
import Navbar from "../components/Layout/Navbar";
import Footer from "../components/Layout/Footer";


const tabs = [
    { label: 'Buses', icon: <BusFront className="text-red-500" /> },
    { label: 'Flights', icon: <Plane className="text-gray-500" /> },
    { label: 'Trains', icon: <TrainFront className="text-gray-500" /> },
    { label: 'Hotels', icon: <Hotel className="text-gray-500" /> }
];

const Home = () => {
    const [from, setFrom] = useState("Nagpur");
    const [to, setTo] = useState("Goa");
    const [date, setDate] = useState("2025-06-27");
    const [activeTab, setActiveTab] = useState('Buses');

    return (

        <>
            <div className="  bg-white  text-gray-800 ">
                {/* Top Navbar */}
                <Navbar />

                {/* Booking Box */}
                <div className="flex justify-center px-4 py-8 bg-[url('https://static.abhibus.com/busimages/img/background-20250613.png')] min-h-screen bg-cover  items-start">

                </div>

            </div>

            <Footer />

        </>
    );
};

export default Home;
