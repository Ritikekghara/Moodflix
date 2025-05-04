import React from 'react';
import EmotionDetector from '../../components/EmotionDetector/EmotionDetector';
import styles from './EmotionSearch.module.css';

const EmotionSearch = () => {
    return (
        <div className={styles.searchContainer}>
            <EmotionDetector />
        </div>
    );
};

export default EmotionSearch;