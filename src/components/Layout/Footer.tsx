import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

const Footer = () => {
    return (
        <footer className=" bg-gray-700 pt-9">
            <div className="mx-auto w-full max-w-7xl px-4 xl:px-0">
                <div className="flex flex-col justify-between sm:px-[18px] md:flex-row md:px-10">
                    <div className="md:w-[316px]">
                        <h1 className="text-white font-extrabold text-xl">
                            <span className="text-rose-600">Rain</span>Feed
                        </h1>
                        <p className="mt-[18px] text-[15px] font-normal text-white/80">
                            Your trusted source for real-time weather updates, rainfall data, and environmental insights.
                            Stay informed with accurate meteorological information and forecasts.
                        </p>
                        <div className="mt-[18px] flex gap-4">
                            <a className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" href="#">
                                <Facebook size={24} className="text-white hover:text-blue-400" />
                            </a>
                            <a className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" href="#">
                                <Linkedin size={24} className="text-white hover:text-blue-600" />
                            </a>
                            <a className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" href="#">
                                <Instagram size={24} className="text-white hover:text-pink-400" />
                            </a>
                            <a className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" href="#">
                                <Twitter size={24} className="text-white hover:text-blue-400" />
                            </a>
                            <a className="hover:scale-110 transition-transform" target="_blank" rel="noopener noreferrer" href="#">
                                <Youtube size={24} className="text-white hover:text-red-500" />
                            </a>
                        </div>
                    </div>
                    <div className="md:w-[316px]">
                        <div className="mt-[23px] flex">
                            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/10">
                                <Phone size={20} className="text-white" />
                            </div>
                            <div className="ml-[18px]">
                                <a href="tel:+911800123444" className="font-Inter text-[14px] font-medium text-white hover:text-rose-400">
                                    +91 1800123444
                                </a>
                                <p className="font-Inter text-[12px] font-medium text-white/80">Support Number</p>
                            </div>
                        </div>
                        <div className="mt-[23px] flex">
                            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/10">
                                <Mail size={20} className="text-white" />
                            </div>
                            <div className="ml-[18px]">
                                <a href="mailto:support@rainfeed.com" className="font-Inter text-[14px] font-medium text-white hover:text-rose-400">
                                    support@rainfeed.com
                                </a>
                                <p className="font-Inter text-[12px] font-medium text-white/80">Support Email</p>
                            </div>
                        </div>
                        <div className="mt-[23px] flex">
                            <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-white/10">
                                <MapPin size={20} className="text-white" />
                            </div>
                            <div className="ml-[18px]">
                                <p className="font-Inter text-[14px] font-medium text-white">
                                    Mumbai, Maharashtra, India
                                </p>
                                <p className="font-Inter text-[12px] font-medium text-white/80">Address</p>
                            </div>
                        </div>
                    </div>
                    <div className=" flex w-full flex-col justify-between text-white sm:flex-row md:mt-0 md:max-w-[341px]">
                        <div>
                            <p className="text-white font-inter text-[18px] font-medium leading-normal">Pages</p>
                            <ul>
                                <li className="mt-[15px]">
                                    <Link to="/" className="text-white hover:text-rose-400 font-inter text-[15px] font-normal transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li className="mt-[15px]">
                                    <Link to="/about" className="text-white hover:text-rose-400 font-inter text-[15px] font-normal transition-colors">
                                        About
                                    </Link>
                                </li>
                                <li className="mt-[15px]">
                                    <Link to="/contact" className="text-white hover:text-rose-400 font-inter text-[15px] font-normal transition-colors">
                                        Contact
                                    </Link>
                                </li>
                                <li className="mt-[15px]">
                                    <Link to="/weather" className="text-white hover:text-rose-400 font-inter text-[15px] font-normal transition-colors">
                                        Weather
                                    </Link>
                                </li>
                                <li className="mt-[15px]">
                                    <Link to="/terms" className="text-white hover:text-rose-400 font-inter text-[15px] font-normal transition-colors">
                                        Terms and conditions
                                    </Link>
                                </li>
                                <li className="mt-[15px]">
                                    <Link to="/privacy" className="text-white hover:text-rose-400 font-inter text-[15px] font-normal transition-colors">
                                        Privacy policy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div className="mt-6 flex flex-col gap-4 sm:mt-0">
                            <p className="text-white font-inter text-[18px] font-medium">Download the app</p>
                            <div className="flex gap-4 sm:flex-col">
                                <a target="_blank" rel="noopener noreferrer" href="#" className="hover:scale-105 transition-transform">
                                    <img alt="Google Play Store" loading="lazy" width="168" height="50" decoding="async" src="https://www.englishyaari.com/img/google-store.svg" />
                                </a>
                                <a target="_blank" rel="noopener noreferrer" href="#" className="hover:scale-105 transition-transform">
                                    <img alt="Apple App Store" loading="lazy" width="168" height="50" decoding="async" src="https://www.englishyaari.com/img/apple-store.svg" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="mt-[30px] border-white/20" />
                <div className="flex items-center justify-center pb-8 pt-[9px] md:py-8">
                    <p className="text-[10px] font-normal text-white md:text-[12px]">
                        © Copyright 2024, All Rights Reserved by RainFeed. PVT. LTD
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;