import React, { useEffect, useState } from 'react';
import StarRating from "./StarRating";
import User from "../interface/UserInterface";
import Review from "../interface/ReviewInterface";

interface ReviewProps {
    review: Review;
}

const ReviewComponent: React.FC<ReviewProps> = ({ review }) => {
    const imageUrl = `http://localhost:8080/api/images/review/${review.image}`;
    const [recipeData, setRecipeData] = useState<User | null>(null);

    useEffect(() => {
        const fetchRecipeData = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/recipes/${review.recipe_id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recipe data');
                }
                const data = await response.json();
                setRecipeData(data);
            } catch (error) {
                console.error('Error fetching recipe data:', error);
            }
        };

        fetchRecipeData();
    },[review.recipe_id]);

    return (
        <div className="review-item">
                {review.image && (
                    <img src={imageUrl} alt="Review" />
                )}
                <p className="review-name">{recipeData?.title}</p>
                <p><StarRating rating={review.rating} /></p>

        </div>
    );
};

export default ReviewComponent;
