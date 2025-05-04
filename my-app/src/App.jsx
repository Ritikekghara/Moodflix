// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Browse from './pages/Browse/Browse';
import EmotionSearch from './pages/EmotionSearch/EmotionSearch';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import SearchResult from './pages/SearchResult/SearchResult'; // Import the new page
import './index.css';

function App() {
    return (
        <Router>
            <Header />
            <main>
                <Routes>
                    <Route path="/" element={<Browse />} />
                    <Route path="/emotion-search" element={<EmotionSearch />} />
                    <Route path="/movie/:movieId" element={<MovieDetail />} />
                    {/* Add the Search Result Route */}
                    <Route path="/search" element={<SearchResult />} />
                    {/* Fallback route */}
                    <Route path="*" element={<Browse />} />
                </Routes>
            </main>
        </Router>
    );
}

export default App;