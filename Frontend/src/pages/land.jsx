import React, { useState, useRef, useEffect } from "react";
import { Button, Spinner } from "@heroui/react";
import AuthModal from "../components/authModal";
import { useAuth } from "../hooks/useAuth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebaseConfig";

export default function Land() {
    const authModalRef = useRef();
    const { isLoading: contextLoading } = useAuth();
    const [localLoading, setLocalLoading] = useState(true);
    const [googleUser, setGoogleUser] = useState(null);

    // Handle Google Sign-In locally, store in googleUser state
    const handleGoogleLogin = async () => {
        setLocalLoading(true);
        try {
            const result = await signInWithPopup(auth, provider);
            const userObj = {
                username: result.user.displayName,
                email: result.user.email,
                profilePicture: result.user.photoURL,
                _id: result.user.uid,
            };
            setGoogleUser(userObj);
        } catch (err) {
            console.error("Google Sign‑In error:", err);
        } finally {
            setLocalLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => setLocalLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (contextLoading || localLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spinner variant="wave" />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen">
            {/* Left Section - Image */}
            <div
                className="hidden md:block w-1/2 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: "url(/img/auth.png)" }}
            ></div>

            {/* Right Section - Login Form */}
            <div className="w-full md:w-1/2 flex justify-center items-center p-8">
                <div className="w-full max-w-sm">
                    <h2 className="text-3xl font-semibold mb-6">Join Us</h2>
                    <div className="flex w-full flex-wrap mb-6 gap-4">
                        <Button
                            className="bg-gradient-to-tr from-gray-50 to-gray-100 text-gray-700 shadow-lg w-72 h-11 hover:shadow-xl transition-shadow"
                            radius="full"
                            onPress={handleGoogleLogin}
                        >
                            <div className="flex items-center justify-center gap-3">
                                <img
                                    src="https://www.google.com/favicon.ico"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                <span className="text-medium font-semibold">
                                    Sign in with Google
                                </span>
                            </div>
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center w-72 h-2">
                            <div className="h-px flex-grow bg-gradient-to-r from-transparent to-gray-500" />
                            <span className="mx-2 font-medium text-gray-500">
                                Or
                            </span>
                            <div className="h-px flex-grow bg-gradient-to-r from-gray-500 to-transparent" />
                        </div>

                        <Button
                            className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white shadow-lg w-72 h-11 hover:shadow-xl transition-all"
                            radius="full"
                            onPress={() => authModalRef.current?.openSignUp()}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                <span className="text-medium font-semibold">
                                    Create New Account
                                </span>
                            </div>
                        </Button>

                        <small className="text-[0.7rem] text-gray-400 text-center leading-none block">
                            By signing up, you agree to our{" "}
                            <a
                                href="#"
                                className="text-gray-500 hover:underline"
                            >
                                Terms
                            </a>
                            ,{" "}
                            <a
                                href="#"
                                className="text-gray-500 hover:underline"
                            >
                                Privacy
                            </a>
                            , and{" "}
                            <a
                                href="#"
                                className="text-gray-500 hover:underline"
                            >
                                Cookies
                            </a>
                            .
                        </small>

                        <div className="mt-14">
                            <p className="text-l font-semibold mb-2 text-cream-200">
                                Already have an account?
                            </p>
                            <Button
                                color="default"
                                variant="bordered"
                                radius="full"
                                className="w-72 h-11 border border-zinc-800 text-cream-200"
                                onPress={() =>
                                    authModalRef.current?.openSignIn()
                                }
                            >
                                <span className="text-medium font-semibold">
                                    Sign in
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <AuthModal ref={authModalRef} />

            {/* Google Info Modal */}
            {googleUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-zinc-900 rounded-2xl shadow-xl p-8 max-w-xs text-center">
                        <h3 className="text-xl font-bold mb-4">
                            👋 Hey, {googleUser.username}!
                        </h3>
                        <img
                            src={googleUser.profilePicture}
                            alt="Profile"
                            className="w-24 h-24 rounded-full mx-auto mb-4"
                        />
                        <p className="mb-4 text-cream-400">
                            We got your Google info! 📬
                        </p>
                        <p className="mb-6 text-sm text-gray-500">
                            Sorry, the dashboard isn’t hooked up yet… but it’s
                            on the way! 🚀
                        </p>
                        <Button
                            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                            radius="full"
                            onPress={() => setGoogleUser(null)}
                        >
                            Close 😄
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
