import React, { useEffect, useState } from 'react';
import '../stylesheets/RecipeDetails.css';
import Recipe from "../interface/RecipeInterface";
import StarRating from '../components/StarRating';
import image_not_found from "../images/image_not_found.png";
import {useNavigate} from "react-router-dom";
import CreateReview from "./CreateReview";
import {fetchRecipeData} from "../api/recipeApi";
import { useRecipeContext } from '../context/RecipeProvider';
import Reviews from "./Reviews";

interface Props {
    recipe: Recipe;
}



const RecipeDetails: React.FC<Props> = ({ recipe }) => {
    const imageUrl = `http://localhost:8080/api/images/recipe/${recipe.image}`;
    const [categories, setCategories] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [showCreateReviewForm, setShowCreateReviewForm] = useState(false);
    const [showReviewsPage, setShowReviewsPage] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage

    const { setRecipes } = useRecipeContext();

    useEffect(() => {
        // Fetch categories and ingredients
        fetchCategories();
        fetchIngredients();
        checkLoginStatus();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/recipes/${recipe.id}/categories`);
            const data = await response.json();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    };

    const fetchIngredients = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/recipes/${recipe.id}/ingredients`);
            const data = await response.json();
            setIngredients(data);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
        }
    };

    function handleEditButtonClick(id: number) {

    }

    const handleDeleteButtonClick = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/recipes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchRecipeData(setRecipes);
                navigate('/recipes'); // Redirect to the recipes list page
            } else {
                console.error("Failed to delete the recipe");
            }
        } catch (error) {
            console.error("Error deleting the recipe:", error);
        }


    };

    const handleReviewButtonClick = () => {
        setShowCreateReviewForm(true);

    }

    function handleReviewPageButtonClick() {
        setShowReviewsPage(true);
    }

    const checkLoginStatus = async () => {
        if (token) {
            setIsLoggedIn(true);
            if (localStorage.getItem("username")=== recipe.username) {
                setIsOwner(true);
            }
        }
    };

    function handleModalClose() {
        setShowCreateReviewForm(false);
        setShowReviewsPage(false);
    }




    return (
        <>
            {showCreateReviewForm && <CreateReview recipeId={recipe.id} onClose={handleModalClose} />}
            {showReviewsPage && <Reviews recipeId={recipe.id} onClose={handleModalClose} />}
            <div className="recipe-details-container">
                <img src={imageUrl} alt={recipe.title} className="recipe-image" onError={(e) => {
                    e.currentTarget.src = image_not_found; // Set a placeholder image
                }} />
                <div className="recipe-info">
                    <h2 className="recipe-title">{recipe.title}</h2>
                    <p> <StarRating rating={recipe.rating} /></p>
                    {/* Conditionally render the button */}
                    {recipe.reviews_id.length > 0 ? (
                        <button className="recipe-details-review-page-button" onClick={handleReviewPageButtonClick}>View Reviews</button>
                    ) : (
                        <button className="recipe-details-review-page-button" disabled>No Reviews</button>
                    )}
                    <div className="separator"></div>
                    <p><strong>Time to Cook:</strong> {recipe.timeToCook}</p>
                    <p><strong>Author:</strong> {recipe.username}</p>
                    <div className="separator"></div>

                    {recipe.videoLink ? (
                        <p><strong>Video Link:</strong> <a href={recipe.videoLink} target="_blank"
                                                           rel="noopener noreferrer">Watch Video</a></p>
                    ) : (
                        <p><strong>Video Link:</strong> No video recipe</p>
                    )}
                    <p style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {categories.map((category, index) => (
                            <div key={index} style={{ background: '#f69512', borderRadius: '5px', padding: '5px', textAlign: 'center' }}>
                                {category}
                            </div>
                        ))}
                    </p>

                    {isLoggedIn && (
                        <>
                            {isOwner ? (
                                <>
                                    <button className="recipe-details-edit-button" onClick={() => handleEditButtonClick(recipe.id)}>Edit</button>
                                    <button className="recipe-details-delete-button" onClick={() => handleDeleteButtonClick(recipe.id)}>Delete</button>
                                </>
                            ) : (
                                <>
                                    <button className="recipe-details-review-button" onClick={handleReviewButtonClick}>Post Review</button>
                                </>
                            )}
                        </>
                    )}

                </div>
            </div>
            <div className="recipe-container-2">
                <h2>Method</h2>
                <p style={{ whiteSpace: 'pre-wrap', textAlign: 'left'}}>{recipe.method}</p>
            </div>

            <div className="recipe-container-3">
                <h2><strong>Ingredients</strong></h2>
                <p> {ingredients.map((ingredient, index) => (
                    <span key={index}>{ingredient}</span>
                ))}</p>
            </div>
        </>
    );
}

export default RecipeDetails;
