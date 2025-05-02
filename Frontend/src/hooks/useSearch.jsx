import { useContext } from "react";
import { SearchContext } from "../contexts/searchContext";

export const useSearch = () => {
    const context = useContext(SearchContext);
    if (!context) {
        console.warn("⚠️ useSearch() must be used inside a SearchProvider");
    }
    return context;
};
