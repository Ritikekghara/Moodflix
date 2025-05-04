// src/pages/MovieDetail/MovieDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getMovieDetails } from '../../services/movieApi';
import styles from './MovieDetail.module.css';

const MovieDetail = () => {
    const { movieId } = useParams(); // Get movie ID from URL parameter
    const [movie, setMovie] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // ... (existing fetchDetails logic) ...
        const fetchDetails = async () => {
            setIsLoading(true);
            setError(null);
            if (!movieId) {
                setError("No movie ID provided.");
                setIsLoading(false);
                return;
            }
            try {
                console.log(`Fetching details for movie ID: ${movieId}`);
                const details = await getMovieDetails(movieId);
                setMovie(details);
            } catch (err) {
                console.error("Failed to fetch movie details:", err);
                setError(err.message || "Could not load movie details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchDetails();
    }, [movieId]);

    // Handler for the "Watch Now" button - UPDATED
    const handleWatchNow = () => {
        if (!movieId) {
            console.error("Movie ID is missing, cannot redirect.");
            // Optionally show an alert or disable the button earlier if no movieId
            alert("Cannot find movie information.");
            return;
        }

        // Construct the URL for the movie's page on TMDB
        const tmdbUrl = `https://www.themoviedb.org/movie/${movieId}`;
        console.log(`Redirecting to: ${tmdbUrl}`);

        // Open the URL in a new browser tab for better user experience
        // 'noopener,noreferrer' are security best practices for _blank links
        window.open(tmdbUrl, '_blank', 'noopener,noreferrer');

        // Remove the old alert simulation
        // alert(`Playing "${movie?.title}"... (Simulation)`);
    };

    // ... (rest of the component: loading, error, not found checks) ...

    if (!movie) {
        return <div className={styles.notFound}>Movie not found.</div>;
    }

    // The return statement remains the same, just the button's onClick handler is changed
    return (
        <div className={styles.detailContainer} style={{ backgroundImage: `url(${movie.backdropUrl || ''})` }}>
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                 <img src={movie.posterUrl} alt={movie.title} className={styles.poster} />
                 <div className={styles.info}>
                    <h1>{movie.title} ({movie.release_year})</h1>
                    <p className={styles.tagline}>{movie.tagline}</p>
                    <div className={styles.genres}>
                         {movie.genres?.map(genre => <span key={genre.id} className={styles.genre}>{genre.name}</span>)}
                     </div>
                     <button onClick={handleWatchNow} className={`${styles.button} ${styles.watchButton}`}>
                         {/* You could rename the button text if desired, e.g., "More Info" or "View on TMDB" */}
                         ▶ Watch Now / More Info
                     </button>
                    <h2>Overview</h2>
                    <p>{movie.overview}</p>
                    <p><strong>Rating:</strong> {movie.rating?.toFixed(1)} / 10</p>
                    {movie.runtime && <p><strong>Runtime:</strong> {movie.runtime} minutes</p>}
                 </div>
            </div>
        </div>
    );
};

export default MovieDetail;