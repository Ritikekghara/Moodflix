import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './Header.module.css';

const Header = () => {
    return (
        <header className={styles.header}>
            {/* Add an empty div on the left for visual balance */}
            {/* Adjust its width/flex-basis in CSS */}
            <div className={styles.leftPlaceholder}></div>

            <Link to="/" className={styles.logo}>Moodflix</Link>

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
        </header>
    );
};

export default Header;