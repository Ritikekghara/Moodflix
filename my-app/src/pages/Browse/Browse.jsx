// src/pages/Browse/Browse.jsx
import React, { useState, useEffect } from 'react';
import MovieList from '../../components/MovieList/MovieList';
import { getTrendingMovies, getMoviesByGenreId } from '../../services/movieApi';
import styles from './Browse.module.css';

// Define Genres to Display (ID and Name)
const GENRES_TO_DISPLAY = [
    { id: 28, name: "Action" },
    { id: 35, name: "Comedy" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thrillers" },
];

const Browse = () => {
    // State to hold movies for each category { trending: [], action: [], comedy: [], ... }
    const [movieCategories, setMovieCategories] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllMovies = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Create promises for all fetches
                const promises = [
                    getTrendingMovies().then(movies => ({ key: 'trending', data: movies })),
                    ...GENRES_TO_DISPLAY.map(genre =>
                        getMoviesByGenreId(genre.id).then(movies => ({
                            key: genre.name.toLowerCase().replace(/\s+/g, ''), // e.g., 'sciencefiction'
                            name: genre.name, // Keep the display name
                            data: movies
                        }))
                    )
                ];

                // Wait for all promises to resolve
                const results = await Promise.allSettled(promises);

                const categoriesData = {};
                results.forEach(result => {
                    if (result.status === 'fulfilled' && result.value) {
                        const { key, name, data } = result.value;
                        categoriesData[key] = { movies: data, title: name || "Trending Now" }; // Store movies and title
                    } else if (result.status === 'rejected') {
                        console.error("Failed to fetch a category:", result.reason);
                        // Optionally set a specific error for the category or a general error
                        if (!error) setError("Could not load all movie categories.");
                    }
                });

                setMovieCategories(categoriesData);

            } catch (err) { // Catch errors not caught by Promise.allSettled (e.g., initial setup error)
                console.error("Failed to fetch initial movie data:", err);
                setError(err.message || "Could not load movie data.");
                setMovieCategories({}); // Clear categories on major error
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllMovies();
    }, []); // Runs once on mount

    if (isLoading) {
        return <div className={styles.message}>Loading movies...</div>;
    }

    // Display error if any fetch failed, even if some succeeded
    if (error && Object.keys(movieCategories).length === 0) {
         return <div className={`${styles.message} ${styles.error}`}>{error}</div>;
    }
     if (!isLoading && Object.keys(movieCategories).length === 0 && !error) {
         return <div className={styles.message}>No movies found.</div>;
     }


    return (
        <div className={styles.browseContainer}>
            {/* Display Trending First */}
            {movieCategories.trending?.movies?.length > 0 && (
                <MovieList title="Trending Now" movies={movieCategories.trending.movies} />
            )}

            {/* Display Genre Categories */}
            {GENRES_TO_DISPLAY.map(genre => {
                const categoryKey = genre.name.toLowerCase().replace(/\s+/g, '');
                const category = movieCategories[categoryKey];
                // Render only if category exists and has movies
                if (category?.movies?.length > 0) {
                    return <MovieList key={categoryKey} title={category.title} movies={category.movies} />;
                }
                return null; // Don't render if no movies for this genre
            })}

            {/* Show general error if some categories failed but others loaded */}
             {error && Object.keys(movieCategories).length > 0 && (
                 <p className={styles.partialError}>Note: Some movie categories failed to load.</p>
             )}
        </div>
    );
};

export default Browse;