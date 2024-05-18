import React, {useEffect, useRef, useState} from 'react';
import Review from "../interface/ReviewInterface";
import ReviewComponent from "../components/ReviewComponent";
import "../stylesheets/Reviews.css";

interface ReviewsProps {
    recipeId: number;
    onClose: () => void;
}

const Reviews: React.FC<ReviewsProps> = ({ recipeId, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/reviews/recipe/${recipeId}`);
                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };

        fetchReviews();
    }, [recipeId]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div className="reviews-modal">
            <div className="reviews-modal-content"  ref={modalRef}>
                {reviews.length > 0 ? (
                    reviews.map(review => <ReviewComponent key={review.id} review={review} />)
                ) : (
                    <p>No reviews available.</p>
                )}
            </div>
        </div>
    );
};

export default Reviews;
