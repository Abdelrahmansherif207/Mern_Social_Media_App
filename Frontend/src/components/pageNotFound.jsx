import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@heroui/react";
import { Spinner } from "@heroui/react";

const Error404 = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1000);
        return () => clearTimeout(timer);
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner variant="wave" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-tr from-black to-zinc-900 text-cream-200 flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-8 relative">
                <div className="text-8xl mb-4 animate-bounce">😢</div>
                <div className="flex">
                    <h1 className="text-9xl font-bold text-cream-200 mb-2">
                        404
                    </h1>
                </div>

                {/* <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"></div> */}
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
                Oops! Lost in the void
            </h2>

            <p className="text-xl text-gray-300 mb-8 max-w-md">
                The page you're looking for doesn't exist
                {/* or has been abducted */}
                {/* by aliens. */}
            </p>

            <div className="flex gap-4 ">
                <Button
                    color="primary"
                    radius="full"
                    className="px-6 py-3 font-semibold"
                    onPress={() => navigate("/")}
                >
                    Take me home
                </Button>

                <Button
                    variant="bordered"
                    radius="full"
                    className="px-6 py-3 border-zinc-800 text-cream-200 hover:bg-gray-800 font-semibold"
                    onPress={() => window.location.reload()}
                >
                    Try again
                </Button>
            </div>
        </div>
    );
};

export default Error404;
