import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import styles from './MovieCard.module.css';

const DEFAULT_POSTER = '/placeholder.png';

// Accept 'id' as a prop
const MovieCard = ({ id, title, posterUrl }) => {
    const handleError = (e) => {
        e.target.onerror = null;
        e.target.src = DEFAULT_POSTER;
    }
    const imageUrl = posterUrl || DEFAULT_POSTER;

    // If no ID, don't make it a link (or handle differently)
    if (!id) {
         return (
             <div className={`${styles.card} ${styles.noLink}`}> {/* Add noLink class if needed */}
                <img src={imageUrl} alt={title || 'Movie poster'} className={styles.poster} onError={handleError} loading="lazy"/>
             </div>
         );
    }

    return (
        // Wrap the card's visual content in a Link
        <Link to={`/movie/${id}`} className={styles.cardLink}> {/* Use Link */}
            <div className={styles.card}>
                <img
                    src={imageUrl}
                    alt={title || 'Movie poster'}
                    className={styles.poster}
                    onError={handleError}
                    loading="lazy"
                />
            </div>
        </Link>
    );
};

export default MovieCard;