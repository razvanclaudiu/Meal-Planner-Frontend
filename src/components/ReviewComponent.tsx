import React from 'react';
import StarRating from "./StarRating";

interface Review {
    id: number;
    user_id: number;
    recipe_id: number;
    description: string;
    rating: number;
    image: string;
}

interface ReviewProps {
    review: Review;
}

const ReviewComponent: React.FC<ReviewProps> = ({ review }) => {
    const imageUrl = `http://localhost:8080/api/images/review/${review.image}`;

    return (
        <div className="review">
            {review.image && (
                <div className="review-image">
                    <img src={imageUrl} alt="Review" />
                </div>
            )}
            <div className="review-body">
                <p>Description: {review.description}</p>
                <p> <StarRating rating={review.rating} /></p>
            </div>

        </div>
    );
};

export default ReviewComponent;
