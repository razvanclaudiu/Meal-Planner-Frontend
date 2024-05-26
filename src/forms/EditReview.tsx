import React, { useEffect, useRef, useState } from 'react';
import '../stylesheets/CreateReview.css';
import Review from '../interface/ReviewInterface';
import {fetchRecipeData} from "../api/recipeApi";
import {useRecipeContext} from "../context/RecipeProvider";

interface EditReviewProps {
    review: Review; // Recipe ID passed as a prop
    onClose: () => void;
}

const EditReview: React.FC<EditReviewProps> = ({ review, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const { setRecipes } = useRecipeContext();

    const [formData, setFormData] = useState<Review>({
        id: review.id,
        user_id: review.user_id, // Assuming you get the user ID from somewhere
        recipe_id: review.recipe_id, // Recipe ID received as a prop
        description: review.description,
        rating: review.rating,
        image: review.image // Assuming you allow users to upload images for their reviews
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const { description, rating } = formData;
        if (description && rating > 0) {
            setIsFormValid(true);
        } else {
            setIsFormValid(false);
        }
    }, [formData]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const imageTypes = ['image/jpeg', 'image/jpg'];

            if (imageTypes.includes(selectedFile.type)) {
                setSelectedFile(selectedFile);
            } else {
                alert('Please select a valid image file (jpeg, jpg).');
            }
        }
    };

    const handleRatingChange = (newRating: number) => {
        setFormData(prevData => ({
            ...prevData,
            rating: newRating
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newReview = { ...formData};

        const token = localStorage.getItem('accessToken');

        // Assuming you have a function to post the review to your API
        if(token) {
            try {
                const response = await fetch(`http://localhost:8080/api/reviews/${newReview.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newReview)
                });

                if (response.ok) {
                    const reviewData = await response.json();
                    const newReviewId = reviewData.id;

                    if(selectedFile) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                            const imageData = reader.result?.toString();

                            try{

                                const imageResponse = await fetch(`http://localhost:8080/api/images/review/upload`, {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        id: newReviewId, // Send the recipe ID
                                        imageData: imageData // Send image data
                                    })
                                });

                                if (imageResponse.ok) {
                                    console.log('File uploaded successfully');
                                } else {
                                    console.log('Failed to upload file');
                                }
                            } catch (error) {
                                console.error('Error uploading file:', error);
                            }
                        };

                        reader.readAsDataURL(selectedFile); // Read file as data URL
                    }
                    const url = `http://localhost:8080/api/users/username/${localStorage.getItem("username")}`;

                    try {
                        const response = await fetch(url, {});
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const userData = await response.json();
                        // Save data in local storage and close modal
                        localStorage.setItem('user', JSON.stringify(userData));
                        fetchRecipeData(setRecipes);
                    }
                    catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                } else {
                    console.error('Failed to create recipe:', response.statusText);
                }
            } catch (error) {
                console.error('Error creating recipe:', error);
            }
        } else {
            console.error('Token not found in localStorage!');
        }
        localStorage.setItem("semaphore", String(Math.random()));
        onClose();
    };

    return (
        <div className="create-review-modal">
            <div className="create-review-modal-content" ref={modalRef}>
                <h2>New Review</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="description">Description: <span className="required">*</span></label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    ></textarea>

                    <label htmlFor="rating">Rating: <span className="required">*</span></label>
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((index) => (
                            <span
                                key={index}
                                className={index <= formData.rating ? 'star-filled' : 'star-empty'}
                                onClick={() => handleRatingChange(index)}
                            >
                                ★
                            </span>
                        ))}
                    </div>

                    {/* Assuming you allow users to upload an image for their review */}
                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept=".jpeg, .jpg"
                        onChange={handleImageChange}
                    />

                    <button type="submit" disabled={!isFormValid}>Post</button>
                </form>
            </div>
        </div>
    );
};

export default EditReview;
