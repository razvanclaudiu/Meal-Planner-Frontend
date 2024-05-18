import React from 'react';
import '../stylesheets/StarRating.css';

interface StarRatingProps {
    rating: number; // Define the type of the rating prop
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
    const totalStars = 5;
    const stars = [];
    const fractionalPart = rating % 1;

    for (let i = 1; i <= totalStars; i++) {
        if (i <= rating) {
            stars.push(<span key={i} className="star filled">★</span>);
        } else if (i === Math.ceil(rating) && fractionalPart > 0 && fractionalPart < 0.5) {
            stars.push(<span key={i} className="star">☆</span>);
        } else if (i === Math.ceil(rating) && fractionalPart >= 0.5) {
            stars.push(<span key={i} className="star half-filled">☆</span>);
        } else {
            stars.push(<span key={i} className="star">☆</span>);
        }
    }

    return <div className="star-rating">{stars}</div>;
};

export default StarRating;
