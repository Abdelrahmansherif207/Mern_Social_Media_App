import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="fixed bottom-0 w-full text-gray-300 py-4 border-zinc-800 z-40">
            <div className="mt-12 pt-8 border-t border-zinc-800 text-sm text-gray-400 text-center">
                <p>
                    © {new Date().getFullYear()} YourBrand. All rights reserved.
                </p>
                <div className="mt-2 space-x-6">
                    <Link
                        to="/privacy"
                        className="hover:text-white transition-colors"
                    >
                        Privacy Policy
                    </Link>
                    <Link
                        to="/terms"
                        className="hover:text-white transition-colors"
                    >
                        Terms of Service
                    </Link>
                    <Link
                        to="/cookies"
                        className="hover:text-white transition-colors"
                    >
                        Cookie Policy
                    </Link>
                </div>
            </div>
        </footer>
    );
}
