import { SearchIcon } from "lucide-react";
import React from "react";
import { useSearch } from "../../hooks/useSearch";

function Search() {
    const { searchUsers } = useSearch();
    const handleSearch = async (event) => {
        const query = event.target.value;
        await searchUsers(query);
    };

    return (
        <div className="w-full flex gap-1 h-20 justify-center items-center ">
            <div className="relative w-full max-w-xs">
                <SearchIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    color="gray"
                />
                <input
                    className="max-w-xs rounded-full bg-transparent border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 p-2 pl-10 w-full"
                    variant="bordered"
                    placeholder="Search someone!"
                    onChange={(event) => handleSearch(event)}
                />
            </div>
        </div>
    );
}

export default Search;
