import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
    Home,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    MessageSquare,
    Bell,
} from "lucide-react";
import { Avatar } from "@heroui/react";
import { useAuth } from "../hooks/useAuth";
const Aside = () => {
    const [isOpen, setIsOpen] = useState(true);
    const { user, logout } = useAuth();

    return (
        <>
            <aside
                className={`h-full fixed left-0 top-0 dark border-r border-zinc-800 flex flex-col z-50 transition-all duration-300 ${
                    isOpen ? "w-80" : "w-16"
                }`}
            >
                {/* Logo/Branding with Close Button */}
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-transparent">
                    {isOpen ? (
                        <>
                            <h2 className="text-lg font-semibold text-white tracking-tight">
                                Brand
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                            >
                                <X className="w-4 h-4 text-cream-300" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsOpen(true)}
                            className="p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                        >
                            <Menu className="w-4 h-4 text-cream-300" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 mt-2 bg-transparent">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            `flex items-center p-2.5 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-gradient-to-tr from-blue-800 to-blue-900 text-white rounded-full"
                                    : "text-cream-300 hover:bg-zinc-800 hover:text-white"
                            }`
                        }
                    >
                        <Home className="w-4 h-4" />
                        {isOpen && (
                            <span className="text-sm font-medium ml-3">
                                Home
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to={`/profile/${user._id}`}
                        className={({ isActive }) =>
                            `flex items-center p-2.5 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-gradient-to-tr from-blue-800 to-blue-900 text-white"
                                    : "text-cream-300 hover:bg-zinc-800 hover:text-white"
                            }`
                        }
                    >
                        <User className="w-4 h-4" />
                        {isOpen && (
                            <span className="text-sm font-medium ml-3">
                                Profile
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to="/messages"
                        className={({ isActive }) =>
                            `flex items-center p-2.5 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-gradient-to-tr from-blue-800 to-blue-900 text-white"
                                    : "text-cream-300 hover:bg-zinc-800 hover:text-white"
                            }`
                        }
                    >
                        <MessageSquare className="w-4 h-4" />
                        {isOpen && (
                            <span className="text-sm font-medium ml-3">
                                Messages
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to="/notifications"
                        className={({ isActive }) =>
                            `flex items-center p-2.5 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-gradient-to-tr from-blue-800 to-blue-900 text-white"
                                    : "text-cream-300 hover:bg-zinc-800 hover:text-white"
                            }`
                        }
                    >
                        <Bell className="w-4 h-4" />
                        {isOpen && (
                            <span className="text-sm font-medium ml-3">
                                Notifications
                            </span>
                        )}
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `flex items-center p-2.5 rounded-lg transition-colors ${
                                isActive
                                    ? "bg-gradient-to-tr from-blue-800 to-blue-900 text-white"
                                    : "text-cream-300 hover:bg-zinc-800 hover:text-white"
                            }`
                        }
                    >
                        <Settings className="w-4 h-4" />
                        {isOpen && (
                            <span className="text-sm font-medium ml-3">
                                Settings
                            </span>
                        )}
                    </NavLink>
                </nav>

                {/* Footer/User Area */}
                <div className="p-4 border-t border-zinc-800 bg-transparent mt-auto ">
                    <button className="flex items-center w-full p-2 text-cream-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors">
                        {isOpen ? (
                            <>
                                <Avatar
                                    src={user?.profilePicture}
                                    size="sm"
                                    className="flex-shrink-0 mr-3"
                                />
                                <span
                                    className="text-sm font-medium flex-1 text-left"
                                    onClick={() => logout()}
                                >
                                    Sign Out
                                </span>
                                <LogOut className="w-4 h-4 flex-shrink-0" />
                            </>
                        ) : (
                            // Only show LogOut icon when closed
                            <LogOut className="w-4 h-4 mx-auto" />
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Aside;
