import axios from 'axios';

// URL of your Flask backend API
const BACKEND_URL = 'http://localhost:5000/predict'; // Ensure this matches your running backend

/**
 * Sends an image blob to the backend for emotion detection using Axios.
 * @param {Blob} imageBlob - The image data as a Blob.
 * @returns {Promise<string>} A promise that resolves with the detected emotion string.
 * @throws {Error} Throws an error if detection or network request fails.
 */
export const detectEmotion = async (imageBlob) => {
    if (!imageBlob) {
        throw new Error("No image blob provided for detection.");
    }

    // Create FormData
    const formData = new FormData();
    // The key 'file' MUST match request.files['file'] in your Flask backend
    formData.append('file', imageBlob, 'frame.jpg');

    try {
        console.log("Sending frame to backend via Axios...");
        const response = await axios.post(BACKEND_URL, formData, {
            // Axios correctly sets Content-Type for FormData
            headers: {
              // Optional: Add any other headers if needed, but usually not for FormData Content-Type
              // 'Content-Type': 'multipart/form-data' // Axios handles this automatically
            }
        });

        console.log("Backend response:", response.data);

        if (response.data && response.data.prediction) {
            return response.data.prediction; // Return the emotion string
        } else if (response.data && response.data.error) {
            // Handle specific errors returned by the backend
            throw new Error(`Backend Error: ${response.data.error}`);
        } else {
            // Handle unexpected response format
            throw new Error("Invalid response format from backend");
        }
    } catch (error) {
        console.error("Error sending image to model:", error);
        // Refine error message if possible (Axios provides error.response)
        const errorMsg = error.response?.data?.error || error.message || "Unknown error during detection";
        if (error.response) {
             // The request was made and the server responded with a status code
             // that falls out of the range of 2xx
             console.error("Backend responded with error:", error.response.status, error.response.data);
             throw new Error(`Backend Error (${error.response.status}): ${errorMsg}`);
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received from backend:", error.request);
            throw new Error("Could not connect to the emotion detection service.");
        } else {
             // Something happened in setting up the request that triggered an Error
             console.error('Axios setup error:', error.message);
             throw new Error(`Detection Error: ${errorMsg}`);
        }
    }
};



// --- Keep the simulation function if you want to test without the backend ---
/*
const possibleEmotions = ["happy", "sad", "angry", "surprise", "neutral", "fear", "disgust"];
let simulationTimeout = null;
export const simulateEmotionDetection = (callback) => {
    if (simulationTimeout) clearTimeout(simulationTimeout);
    console.log("Simulating emotion detection...");
    simulationTimeout = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * possibleEmotions.length);
        const simulatedEmotion = possibleEmotions[randomIndex];
        console.log(`Simulation result: ${simulatedEmotion}`);
        callback(simulatedEmotion);
    }, 2000);
};

// If simulating:
// export const detectEmotion = (videoElementOrImageData, callback) => {
//     simulateEmotionDetection(callback);
// };
*/