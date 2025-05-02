import { createContext } from "react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SearchContext = createContext();
const SearchProvider = ({ children }) => {
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { token } = useAuth();

    const searchUsers = async (query) => {
        if (!query) {
            setSearchResult([]);
            return;
        }
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `${BASE_URL}/users/search?query=${query}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            setSearchResult(data);
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <SearchContext.Provider
            value={{ searchResult, loading, error, searchUsers }}
        >
            {children}
        </SearchContext.Provider>
    );
};

export { SearchContext, SearchProvider };
