import React from "react";
// import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { Rocket, Coffee, Clock, Zap } from "lucide-react";
import Aside from "../components/aside";
import SearchAside from "../components/search/searchAside";

const ComingSoon = () => {
    // const navigate = useNavigate();

    return (
        <div className="flex justify-between z-50">
            <div className="w-1/4">
                <Aside />
            </div>
            <main className="w-3/5 min-h-screen flex flex-col items-start p-5">
                {/* Back Button */}
                <div className="absolute top-4 left-[calc(20%+1rem)]"></div>

                {/* Main Content */}
                <div className="w-full flex flex-col items-center justify-center mt-8">
                    {/* Animated Rocket */}
                    <div className="relative mb-4">
                        <div className="text-6xl mb-2 animate-bounce">🚀</div>
                    </div>

                    <h1 className="text-4xl font-bold text-white mb-2 animate-pulse">
                        Coming Soon!
                    </h1>
                    <p className="text-lg text-gray-300 mb-4 text-center">
                        We're working hard to bring you something amazing.
                        <span className="block mt-1">Stay tuned! ⚡</span>
                    </p>

                    {/* Features */}
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-6 w-1/2">
                        <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                            <Rocket className="w-6 h-6 mx-auto mb-1 text-blue-400" />
                            <p className="text-xs text-gray-300 text-center">
                                Blazing Fast
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                            <Coffee className="w-6 h-6 mx-auto mb-1 text-amber-400" />
                            <p className="text-xs text-gray-300 text-center">
                                Powered by Coffee
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                            <Clock className="w-6 h-6 mx-auto mb-1 text-purple-400" />
                            <p className="text-xs text-gray-300 text-center">
                                24/7 Development
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                            <Zap className="w-6 h-6 mx-auto mb-1 text-yellow-400" />
                            <p className="text-xs text-gray-300 text-center">
                                Lightning Speed
                            </p>
                        </div>
                    </div>

                    {/* Fun Message */}
                    <p className="mt-6 text-gray-400 text-xs text-center">
                        P.S. Our developers are currently fueled by coffee and
                        determination! ☕
                    </p>
                </div>
            </main>
            {/* <div className="w-1/4"> */}
            <SearchAside />
            {/* </div> */}
        </div>
    );
};

export default ComingSoon;
