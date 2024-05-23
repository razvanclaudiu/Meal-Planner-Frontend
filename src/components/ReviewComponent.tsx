import React, { useEffect, useState } from 'react';
import StarRating from "./StarRating";
import User from "../interface/UserInterface";
import Review from "../interface/ReviewInterface";

interface ReviewProps {
    review: Review;
}

const ReviewComponent: React.FC<ReviewProps> = ({ review }) => {
    const imageUrl = `http://localhost:8080/api/images/review/${review.image}`;
    const [userData, setUserData] = useState<User | null>(null);

    async function fetchUserData(userId: number): Promise<void> {
        const url = `http://localhost:8080/api/users/${userId}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data: User = await response.json();
            setUserData(data);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    }

    useEffect(() => {
        fetchUserData(review.user_id);
    }, [review.user_id]);

    return (
        <div className="review">
            <div className="review-header">
                {review.image && (
                    <div className="review-image">
                        <img src={imageUrl} alt="Review" />
                    </div>
                )}
                <p><StarRating rating={review.rating} /></p>

            </div>
            <div className="review-body">
                <h2>Review Description</h2>
                {userData && <p className="review-author">By {userData.username}</p>}
                <p>{review.description}</p>
            </div>
        </div>
    );
};

export default ReviewComponent;
