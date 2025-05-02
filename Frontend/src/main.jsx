import { createRoot } from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { SearchProvider } from "./contexts/searchContext.jsx";
import { FollowProvider } from "./contexts/followingContext.jsx";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <HeroUIProvider>
        <AuthProvider>
            <FollowProvider>
                <SearchProvider>
                    <main className="">
                        <App />
                    </main>
                </SearchProvider>
            </FollowProvider>
        </AuthProvider>
    </HeroUIProvider>
);
