import React, { useState, useRef, useEffect, useCallback } from 'react';
import { detectEmotion } from '../../services/emotionService'; // Uses Axios now
import { getMoviesForEmotion } from '../../services/movieApi'; // Uses Axios & TMDB now
import MovieList from '../MovieList/MovieList';
import styles from './EmotionDetector.module.css';

// Match canvas dimensions to backend expectations or desired preview size
const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 240;

const EmotionDetector = () => {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [detectedEmotion, setDetectedEmotion] = useState(null);
    const [suggestedMovies, setSuggestedMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Combined loading state
    const [error, setError] = useState(null);
    const [statusMessage, setStatusMessage] = useState(''); // For user feedback

    const videoRef = useRef(null);
    const canvasRef = useRef(null); // Add canvas ref
    const streamRef = useRef(null);

    // Function to start the camera
    const startCamera = async () => {
        setError(null);
        setStatusMessage('');
        setDetectedEmotion(null);
        setSuggestedMovies([]);
        if (isCameraOn) return; // Prevent restarting if already on

        setIsLoading(true);
        setStatusMessage('Starting camera...');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                 video: { width: { ideal: CANVAS_WIDTH }, height: { ideal: CANVAS_HEIGHT } }
             });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setIsCameraOn(true);
                    setIsLoading(false);
                    setStatusMessage('Camera ready. Click "Snap & Analyse".');
                    console.log("Camera started");
                };
                 videoRef.current.onerror = () => {
                     throw new Error("Video playback failed.");
                 }
            } else {
                 throw new Error("Video element not found.");
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(`Could not access camera: ${err.message}. Please check permissions.`);
            setIsLoading(false);
            setIsCameraOn(false); // Ensure state reflects failure
            setStatusMessage('');
            stopCamera(); // Clean up potentially partially started stream
        }
    };

    // Function to stop the camera
    const stopCamera = useCallback(() => {
        console.log("Stopping camera...");
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsCameraOn(false);
        // Don't clear status/error here, might be useful after capture
        console.log("Camera stopped");
    }, []);

    // Cleanup camera on component unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    // Function to capture frame, send for detection, and fetch movies
    const captureAndDetect = () => {
        if (!videoRef.current || !canvasRef.current || !isCameraOn || isLoading) {
             console.warn("Capture blocked: Camera not ready, canvas missing, or already loading.");
            return;
        }

        setError(null);
        setDetectedEmotion(null);
        setSuggestedMovies([]);
        setIsLoading(true);
        setStatusMessage('Capturing frame...');

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

         if (!context) {
             setError("Could not get canvas context.");
             setIsLoading(false);
             setStatusMessage('');
             return;
         }

        // Set canvas dimensions (important!)
        canvas.width = videoRef.current.videoWidth || CANVAS_WIDTH;
        canvas.height = videoRef.current.videoHeight || CANVAS_HEIGHT;

        // Draw the current video frame to the hidden canvas
        // Handle mirroring: Draw normally, backend expects non-mirrored typically.
        // If your video CSS has transform: scaleX(-1), drawImage captures the *original* frame.
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            if (!blob) {
                setError("Failed to create image blob.");
                setIsLoading(false);
                setStatusMessage('');
                return;
            }

            setStatusMessage('Analysing mood...');
            try {
                // Send blob to backend via emotionService
                const emotion = await detectEmotion(blob); // This now uses Axios
                setDetectedEmotion(emotion);
                setStatusMessage(`Detected mood: ${emotion}. Fetching suggestions...`);

                // Fetch movies based on detected emotion via movieApi
                const movies = await getMoviesForEmotion(emotion);
                setSuggestedMovies(movies);
                setStatusMessage(`Suggestions for ${emotion} mood:`);

            } catch (err) {
                console.error("Detection or Fetching failed:", err);
                setError(err.message || "An unknown error occurred."); // Display error from service
                setDetectedEmotion(null); // Clear emotion on error
                setSuggestedMovies([]);
                setStatusMessage(''); // Clear status message on error
            } finally {
                setIsLoading(false);
                 // Decide if you want to stop the camera after each analysis
                 // stopCamera(); // Uncomment to stop camera after analysis
                 if (!streamRef.current) { // If stopCamera was called
                    setStatusMessage(error ? `Analysis failed. ${error}` : `Analysis complete. Start camera again to retry.`);
                 }
            }
        }, 'image/jpeg', 0.90); // Use JPEG format, 90% quality
    };

    return (
        <div className={styles.detectorContainer}>
            <h2>Find Movies by Your Mood</h2>

             {/* Status and Error Messages */}
            {statusMessage && !error && <p className={styles.status}>{statusMessage}</p>}
            {error && <p className={styles.error}>{error}</p>}

            {/* Video Feed and Canvas */}
            <div className={styles.videoContainer}>
                 {/* Video element for live feed */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`${styles.videoFeed} ${isCameraOn ? styles.visible : ''}`}
                    width={CANVAS_WIDTH} // Set dimensions for layout consistency
                    height={CANVAS_HEIGHT}
                />
                {/* Hidden canvas for capturing frames */}
                 <canvas
                    ref={canvasRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    style={{ display: 'none' }} // Keep canvas hidden
                 />
                {!isCameraOn && !isLoading && (
                     <div className={styles.placeholder}>Camera is off</div>
                )}
                 {isLoading && !isCameraOn && ( // Show loading when starting camera
                      <div className={styles.loadingOverlay}>Starting Camera...</div>
                 )}
            </div>

            {/* Controls */}
            <div className={styles.controls}>
                {!isCameraOn ? (
                    <button onClick={startCamera} disabled={isLoading} className={styles.button}>
                        {isLoading ? 'Starting...' : 'Start Camera'}
                    </button>
                ) : (
                    <>
                        {/* Button to trigger capture and detection */}
                        <button
                            onClick={captureAndDetect}
                            disabled={isLoading || !isCameraOn}
                            className={styles.button}
                        >
                            {isLoading ? 'Analysing...' : 'Snap & Analyse Mood'}
                        </button>
                         <button onClick={stopCamera} className={`${styles.button} ${styles.stopButton}`} disabled={isLoading}>
                            Stop Camera
                        </button>
                    </>
                )}
            </div>


            {/* Results Area */}
            {/* Only show results section if an emotion was detected OR movies were suggested */}
            {(detectedEmotion || suggestedMovies.length > 0) && !isLoading && !error && (
                 <div className={styles.results}>
                    {/* MovieList will show its own title */}
                    <MovieList
                        title={detectedEmotion ? `Suggestions for ${detectedEmotion}` : 'Suggestions'}
                        movies={suggestedMovies} />
                 </div>
            )}
             {/* Show message if emotion detected but no movies found */}
             {detectedEmotion && suggestedMovies.length === 0 && !isLoading && !error && (
                 <p className={styles.noMoviesMessage}>No movie suggestions found for '{detectedEmotion}'.</p>
             )}

        </div>
    );
};

export default EmotionDetector;