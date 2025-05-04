import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchMovies } from '../../services/movieApi';
import MovieList from '../../components/MovieList/MovieList'; // Reuse MovieList
import styles from './SearchResult.module.css';

const SearchResult = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams(); // Hook to get URL query parameters

    const query = searchParams.get('query'); // Get the 'query' value

    useEffect(() => {
        // Function to fetch search results
        const fetchSearchResults = async () => {
            if (!query) {
                setSearchResults([]); // Clear results if query is missing
                setError("Please enter a search term."); // Optional: prompt user
                return;
            }

            setIsLoading(true);
            setError(null);
            try {
                console.log(`Fetching search results for: ${query}`);
                const results = await searchMovies(query);
                setSearchResults(results);
            } catch (err) {
                console.error("Search failed:", err);
                setError(err.message || "Could not fetch search results.");
                setSearchResults([]); // Clear results on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();

        // Cleanup function (optional, not strictly needed here)
        // return () => { console.log("Cleaning up search results"); };

    }, [query]); // Re-run the effect ONLY when the 'query' changes

    return (
        <div className={styles.searchContainer}>
            {/* Display Search Query */}
            {query && <h1 className={styles.title}>Search Results for: "{query}"</h1>}
            {!query && <h1 className={styles.title}>Please enter a search term in the header.</h1>}


            {/* Display Loading State */}
            {isLoading && <div className={styles.message}>Searching...</div>}

            {/* Display Error Message */}
            {error && !isLoading && <div className={`${styles.message} ${styles.error}`}>{error}</div>}

            {/* Display Results using MovieList */}
            {!isLoading && !error && searchResults.length > 0 && (
                // Pass results directly to MovieList - it handles the grid and "Show More"
                 <MovieList title="" movies={searchResults} /> // No need for separate title here
            )}

            {/* Display No Results Message */}
            {!isLoading && !error && searchResults.length === 0 && query && (
                <div className={styles.message}>No movies found matching "{query}".</div>
            )}
        </div>
    );
};

export default SearchResult;