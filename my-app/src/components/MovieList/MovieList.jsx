import React, { useState } from 'react'; // Import useState
import MovieCard from '../MovieCard/MovieCard';
import styles from './MovieList.module.css';

// Define how many movies to show initially
const INITIAL_VISIBLE_COUNT = 8; // Display 5 movies by default

const MovieList = ({ title, movies = [] }) => {
    // State to track if the list is expanded
    const [isExpanded, setIsExpanded] = useState(false);

    // Handle empty or loading states
    if (!movies || movies.length === 0) {
        // Optionally, you could return null or a different message
        // if you don't want to show the title for empty lists
        return (
            <div className={styles.listContainer}>
                <h2 className={styles.title}>{title}</h2>
                <p className={styles.noMovies}>No movies found for this category.</p>
            </div>
        );
    }

    // Determine which movies to display based on the expansion state
    const moviesToShow = isExpanded ? movies : movies.slice(0, INITIAL_VISIBLE_COUNT);

    // Check if the toggle button should be displayed
    const showToggleButton = movies.length > INITIAL_VISIBLE_COUNT;

    // Handler to toggle the expansion state
    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className={styles.listContainer}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.movieRow}>
                {moviesToShow.map((movie) => (
                    <MovieCard
                        key={movie.id}
                        id={movie.id}
                        title={movie.title}
                        posterUrl={movie.posterUrl}
                    />
                ))}
            </div>

            {/* Conditionally render the Show More/Less button */}
            {showToggleButton && (
                <div className={styles.toggleButtonContainer}>
                    <button onClick={handleToggleExpand} className={styles.toggleButton}>
                        {isExpanded ? 'Show Less' : 'Show More'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MovieList;