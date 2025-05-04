import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Browse from './pages/Browse/Browse';
import EmotionSearch from './pages/EmotionSearch/EmotionSearch';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import './index.css'; // Import global styles

function App() {
    return (
        <Router>
            <Header />
            <main> {/* Wrap routes in main for semantics */}
                <Routes>
                    <Route path="/" element={<Browse />} />
                    <Route path="/emotion-search" element={<EmotionSearch />} />
                    <Route path="/movie/:movieId" element={<MovieDetail />} />
                    {/* Add other routes here later (e.g., Movie Details, Profile) */}
                    <Route path="*" element={<Browse />} /> {/* Fallback to Browse */}
                </Routes>
            </main>
        </Router>
    );
}

export default App;