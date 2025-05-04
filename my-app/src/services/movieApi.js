import axios from 'axios';

// Get API Key from environment variables
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const TMDB_API_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w300"; // Poster size (w200, w300, w500...)

if (!TMDB_API_KEY) {
    console.error("TMDB API Key not found. Make sure VITE_TMDB_API_KEY is set in your .env file.");
}



/**
 * Fetches movies from TMDB for a specific genre ID.
 * @param {number} genreId - The TMDB ID of the genre.
 * @returns {Promise<Array<object>>} A promise resolving with an array of movie objects.
 * @throws {Error} If fetching fails.
 */
export const getMoviesByGenreId = async (genreId) => {
    if (!TMDB_API_KEY) throw new Error("TMDB API Key is missing.");
    if (!genreId) throw new Error("Genre ID is required.");

    console.log(`Fetching TMDB movies for Genre ID: ${genreId}`);
    try {
        const response = await axios.get(`${TMDB_API_URL}/discover/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                sort_by: 'popularity.desc',
                with_genres: genreId,
                include_adult: false,
                'vote_count.gte': 50, // Adjust vote count threshold if needed
                page: 1 // Fetch first page
            },
        });

        if (response.data?.results) {
            return response.data.results.map(movie => ({
                id: movie.id,
                title: movie.title,
                posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.png',
                // We know the primary genre ID we searched for
            }));
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error fetching movies for genre ${genreId}:`, error);
        if (error.response) {
            throw new Error(`Failed to fetch genre ${genreId}: ${error.response.data?.status_message || error.message}`);
        } else {
            throw new Error(`Failed to fetch genre ${genreId}: ${error.message}`);
        }
    }
};


// ... (keep existing imports and functions) ...

const TMDB_DETAIL_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // Larger poster
const TMDB_BACKDROP_BASE_URL = "https://image.tmdb.org/t/p/w1280"; // Backdrop size

/**
 * Fetches detailed information for a specific movie from TMDB.
 * @param {string|number} movieId - The ID of the movie.
 * @returns {Promise<object>} A promise that resolves with the detailed movie object.
 * @throws {Error} If fetching fails.
 */
export const getMovieDetails = async (movieId) => {
    if (!TMDB_API_KEY) {
        throw new Error("TMDB API Key is missing.");
    }
    if (!movieId) {
         throw new Error("Movie ID is required.");
    }
    console.log(`Fetching details for movie ID: ${movieId} from TMDB`);

    try {
        const response = await axios.get(`${TMDB_API_URL}/movie/${movieId}`, {
            params: {
                api_key: TMDB_API_KEY,
                // append_to_response: 'videos,credits' // Optionally fetch more data
            },
        });

        if (response.data) {
            // Map TMDB detail result to a more structured format
            const movie = response.data;
            return {
                id: movie.id,
                title: movie.title,
                overview: movie.overview,
                tagline: movie.tagline,
                posterUrl: movie.poster_path ? `${TMDB_DETAIL_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.png',
                backdropUrl: movie.backdrop_path ? `${TMDB_BACKDROP_BASE_URL}${movie.backdrop_path}` : null,
                release_date: movie.release_date,
                release_year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
                genres: movie.genres || [], // Array of {id, name}
                rating: movie.vote_average,
                runtime: movie.runtime, // In minutes
                // Add more fields as needed (e.g., from append_to_response)
            };
        } else {
            throw new Error("No data received from TMDB for movie details.");
        }
    } catch (error) {
        console.error(`Error fetching details for movie ${movieId}:`, error);
        if (error.response) {
             // Handle TMDB specific errors (like 404 Not Found)
            if (error.response.status === 404) {
                throw new Error(`Movie with ID ${movieId} not found.`);
            }
            throw new Error(`Failed to fetch movie details: ${error.response.data?.status_message || error.message}`);
        } else {
            throw new Error(`Failed to fetch movie details: ${error.message}`);
        }
    }
};

// ... (keep existing functions like getMoviesForEmotion, getTrendingMovies) ...




// Map emotions to TMDb genre IDs (Customize as needed)
const emotionToGenreMap = {
    angry: 28,    // Action
    disgust: 99,  // Documentary (or choose something else like 27 Horror?)
    fear: 27,     // Horror
    happy: 35,    // Comedy
    sad: 18,      // Drama
    surprise: 9648, // Mystery (or 12 Adventure?)
    neutral: 10749, // Romance (or 878 Sci-Fi?)
};

/**
 * Fetches movies from TMDB based on a detected emotion.
 * @param {string} emotion - The detected emotion (lowercase).
 * @returns {Promise<Array<object>>} A promise that resolves with an array of movie objects.
 * @throws {Error} If fetching fails.
 */
export const getMoviesForEmotion = async (emotion) => {
    if (!TMDB_API_KEY) {
         throw new Error("TMDB API Key is missing.");
    }
    const lowerEmotion = emotion.toLowerCase();
    // Default to a popular genre (e.g., Comedy ID 35) if emotion not mapped
    const genreId = emotionToGenreMap[lowerEmotion] || 35;
    console.log(`Fetching TMDB movies for emotion: ${emotion}, Genre ID: ${genreId}`);

    try {
        const response = await axios.get(`${TMDB_API_URL}/discover/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                sort_by: 'popularity.desc',
                with_genres: genreId,
                include_adult: false, // Exclude adult content
                'vote_count.gte': 100, // Filter for movies with a minimum number of votes
                 page: 1
            },
        });

        if (response.data && response.data.results) {
            // Map TMDB results to our desired format
            const movies = response.data.results.map(movie => ({
                id: movie.id,
                title: movie.title,
                // Construct the full poster URL, handle cases where poster_path might be null
                posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.png', // Use placeholder if no poster
                genre: genreId // We know the genre we searched for
            }));
            console.log(`Found ${movies.length} movies for genre ${genreId}`);
            return movies;
        } else {
            return []; // Return empty array if no results
        }
    } catch (error) {
        console.error("Error fetching movies from TMDB:", error);
        if (error.response) {
            console.error("TMDB Error:", error.response.status, error.response.data);
            throw new Error(`Failed to fetch movies: ${error.response.data?.status_message || error.message}`);
        } else {
             throw new Error(`Failed to fetch movies: ${error.message}`);
        }
    }
};

/**
 * Fetches trending movies from TMDB.
 * @returns {Promise<Array<object>>} A promise that resolves with an array of trending movie objects.
 */
export const getTrendingMovies = async () => {
     if (!TMDB_API_KEY) {
         throw new Error("TMDB API Key is missing.");
    }
    console.log("Fetching Trending Movies from TMDB");
    try {
        const response = await axios.get(`${TMDB_API_URL}/trending/movie/week`, {
            params: { api_key: TMDB_API_KEY },
        });
        if (response.data && response.data.results) {
             const movies = response.data.results.map(movie => ({
                id: movie.id,
                title: movie.title,
                posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : '/placeholder.png',
                // Note: genre IDs are in movie.genre_ids array, you might need another API call
                // or a local genre map to get genre names if needed for the Browse page.
            }));
            return movies;
        } else {
            return [];
        }
    } catch (error) {
         console.error("Error fetching trending movies:", error);
          if (error.response) {
            throw new Error(`Failed to fetch trending movies: ${error.response.data?.status_message || error.message}`);
        } else {
             throw new Error(`Failed to fetch trending movies: ${error.message}`);
        }
    }
};

// You can add getMoviesByGenre if needed for Browse page, similar to getMoviesForEmotion
// export const getMoviesByGenre = async (genreNameOrId) => { ... }