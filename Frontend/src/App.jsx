import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
} from "react-router-dom";
import Home from "./pages/home";
import Land from "./pages/land";
import Footer from "./components/footer";
import PageNotFound from "./components/pageNotFound";
import Profile from "./pages/profile";
import ComingSoon from "./pages/comming";
import ProtectedRoute from "./components/protect";
import { PostProvider } from "./contexts/postContext";
import Settings from "./pages/settings";

function AppLayout() {
    const location = useLocation();
    const hideFooter = location.pathname !== "/land";

    return (
        <div className="flex flex-col min-h-screen">
            <Routes>
                <Route path="/land" element={<Land />}></Route>
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <PostProvider>
                                <Home />
                            </PostProvider>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile/:id"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route path="/messages" element={<ComingSoon />} />
                <Route
                    path="settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<PageNotFound />} />
            </Routes>
            {!hideFooter && <Footer />}
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}
