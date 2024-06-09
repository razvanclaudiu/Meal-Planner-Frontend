import React, { useEffect, useRef, useState } from 'react';
import '../stylesheets/CreateReview.css';
import Review from '../interface/ReviewInterface';
import {fetchRecipeData} from "../api/recipeApi";
import {useRecipeContext} from "../context/RecipeProvider";

interface EditReviewProps {
    review: Review;
    updateUser: () => void;
    onClose: () => void;
}

const EditReview: React.FC<EditReviewProps> = ({ review,updateUser, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const { setRecipes } = useRecipeContext();

    const [formData, setFormData] = useState<Review>({
        id: review.id,
        user_id: review.user_id,
        recipe_id: review.recipe_id,
        description: review.description,
        rating: review.rating,
        image: review.image
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
                                        id: newReviewId,
                                        imageData: imageData
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

                        reader.readAsDataURL(selectedFile);
                    }
                    const url = `http://localhost:8080/api/users/username/${localStorage.getItem("username")}`;

                    try {
                        const response = await fetch(url, {});
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const userData = await response.json();
                        localStorage.setItem('user', JSON.stringify(userData));
                        updateUser();
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
        onClose();
    };

    return (
        <div className="create-review-modal">
            <div className="create-review-modal-content" ref={modalRef}>
                <h2>Edit Review</h2>
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

                    <label htmlFor="image">Image:</label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept=".jpeg, .jpg"
                        onChange={handleImageChange}
                    />

                    <button type="submit" disabled={!isFormValid}>Submit Edit</button>
                </form>
            </div>
        </div>
    );
};

export default EditReview;
