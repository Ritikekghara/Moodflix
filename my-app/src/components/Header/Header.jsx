import React, { useState } from 'react'; // Import useState
import { Link, NavLink, useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './Header.module.css';
import { FaSearch } from 'react-icons/fa'; // Import a search icon (install react-icons: npm install react-icons)

const Header = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate(); // Hook for programmatic navigation

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission
        if (searchTerm.trim()) { // Only navigate if search term is not empty
            // Navigate to the search results page with the query parameter
            navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm(''); // Clear the search bar after submission
        }
    };

    return (
        <header className={styles.header}>
            {/* Left Placeholder for balance */}
            <div className={styles.leftPlaceholder}>
                 <nav className={styles.nav}>
                     <NavLink
                        to="/"
                        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                        end
                    >
                        Browse
                    </NavLink>
                    <NavLink
                        to="/emotion-search"
                        className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
                    >
                        Mood Search
                    </NavLink>
                 </nav>
            </div>

            {/* Logo remains centered */}
            <Link to="/" className={styles.logo}>Moodflix</Link>

            {/* Right side: Search */}
            <div className={styles.rightContent}>
                <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
                    <input
                        type="search"
                        placeholder="Search titles or genres..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton}>
                        <FaSearch /> {/* Search Icon */}
                    </button>
                </form>
                 {/* You could add other icons here later like Profile, Notifications */}
            </div>
        </header>
    );
};

export default Header;