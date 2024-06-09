import React, { useEffect, useState } from 'react';
import '../stylesheets/RecipeDetails.css';
import Recipe from "../interface/RecipeInterface";
import StarRating from '../components/StarRating';
import image_not_found from "../assets/images/image_not_found.png";
import { useNavigate } from "react-router-dom";
import CreateReview from "../forms/CreateReview";
import { fetchRecipeData } from "../api/recipeApi";
import Reviews from "./Reviews";
import { useRecipeContext } from "../context/RecipeProvider";
import Review from "../interface/ReviewInterface";
import Quantity from "../interface/QuantityInterface";
import Ingredient from "../interface/IngredientInterface";
import EditRecipe from "../forms/EditRecipe";
import EditReview from "../forms/EditReview";
import {FacebookShareButton, FacebookIcon, WhatsappShareButton, WhatsappIcon} from "react-share";

interface Props {
    recipe: Recipe;
    updateUser : () => void;
    checkNotif: (id: number) => void;
}

const RecipeDetails: React.FC<Props> = ({ recipe,updateUser, checkNotif }) => {
    const imageUrl = `http://localhost:8080/api/images/recipe/${recipe.image}`;
    const [categories, setCategories] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [quantities, setQuantities] = useState<Quantity[]>([]);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [hasReviewed, setHasReviewed] = useState<boolean>(false);
    const [showCreateReviewForm, setShowCreateReviewForm] = useState(false);
    const [showEditRecipeForm, setShowEditRecipeForm] = useState(false);
    const [showReviewsPage, setShowReviewsPage] = useState(false);
    const [showEditReviewForm, setShowEditReviewForm] = useState(false);
    const [review, setReview] = useState<Review>({} as Review);
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken'); // Retrieve the token from localStorage

    const { setRecipes } = useRecipeContext();

    useEffect(() => {
        fetchCategories();
        fetchIngredients();
        fetchQuantities();
        fetchReviews();
        checkLoginStatus();
    }, [showCreateReviewForm]);

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
            const response = await fetch(`http://localhost:8080/api/ingredients/recipe/${recipe.id}`);
            const data = await response.json();
            setIngredients(data);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
        }
    };

    const fetchQuantities = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/quantities/recipe/${recipe.id}`);
            const data = await response.json();
            setQuantities(data);
        } catch (error) {
            console.error("Error fetching quantities:", error);
        }
    }

    const fetchReviews = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/reviews/recipe/${recipe.id}`);
            const data = await response.json();
            data.forEach((review: Review) => {
                if (review.user_id === parseInt(localStorage.getItem('userId') || '0', 10)) {
                    setHasReviewed(true);
                    setReview(review);
                }
            });
        } catch (error) {
            console.error("Error fetching reviews:", error);
        }
    }

    const handleEditButtonClick = (id: number) => {
        setShowEditRecipeForm(true);
    };

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
                navigate('/recipes');
            } else {
                console.error("Failed to delete the recipe");
            }
        } catch (error) {
            console.error("Error deleting the recipe:", error);
        }
    };

    const handleReviewButtonClick = () => {
        setShowCreateReviewForm(true);
    };

    const handleReviewPageButtonClick = () => {
        setShowReviewsPage(true);
    };

    const handleEditReviewButtonClick = () => {
        setShowEditReviewForm(true);
    };

    const handleDeleteReviewButtonClick = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your review?");
        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/reviews/${review.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                setHasReviewed(false);
                setReview({} as Review);
                fetchRecipeData(setRecipes);
            } else {
                console.error("Failed to delete the review");
            }
        } catch (error) {
            console.error("Error deleting the review:", error);
        }
    };

    const checkLoginStatus = () => {
        if (token) {
            setIsLoggedIn(true);
            if (localStorage.getItem("username") === recipe.username) {
                setIsOwner(true);
            }
        }
    };

    const handleModalClose = () => {
        setShowCreateReviewForm(false);
        setShowReviewsPage(false);
        if(showEditReviewForm)
        {
            setShowEditReviewForm(false);
            fetchReviews();
        }

        if(showEditRecipeForm) {
            setShowEditRecipeForm(false);
            window.location.reload();
        }

    };

    const getIngredientQuantity = (ingredient: number) => {
        const quantity = quantities.find(q => q.ingredientId === ingredient);
        return quantity ? quantity.quantity : '';
    };

    const url = `https://6986-188-27-132-209.ngrok-free.app/recipe/${recipe.id}`;
    const title = "Check out this recipe from Munchie!";
    const message = `${title}\n${url}`;


    return (
        <>
            {showEditRecipeForm && <EditRecipe recipe={recipe} onClose={handleModalClose} />}
            {showCreateReviewForm && <CreateReview recipeId={recipe.id} updateUser={updateUser} onClose={handleModalClose} checkNotif={checkNotif} />}
            {showReviewsPage && <Reviews recipeId={recipe.id} onClose={handleModalClose} />}
            {showEditReviewForm && <EditReview  review={review} updateUser={updateUser} onClose={handleModalClose}  />}
            <div className="recipe-details-container">
                <img src={imageUrl} alt={recipe.title} className="recipe-image" onError={(e) => {
                    e.currentTarget.src = image_not_found;
                }} />
                <div className="recipe-info">
                    <h2 className="recipe-title">{recipe.title}</h2>
                    <p> <StarRating rating={recipe.rating} /></p>
                    <div className="share-buttons">
                        {recipe.reviews_id.length > 0 ? (
                            <button className="recipe-details-review-page-button" onClick={handleReviewPageButtonClick}>View Reviews</button>
                        ) : (
                            <button className="recipe-details-review-page-button" disabled>No Reviews</button>
                        )}
                        <FacebookShareButton className="facebook-share-button" url={url} hashtag={"#Munchie"}>
                            <FacebookIcon size={30} round={true} />
                        </FacebookShareButton>
                        <WhatsappShareButton className="whatsapp-share-button" url={message} >
                            <WhatsappIcon size={30} round={true} />
                        </WhatsappShareButton>
                    </div>
                    <div className="separator"></div>
                    <p><strong>Time to Cook:</strong> {recipe.timeToCook}</p>
                    <p><strong>Author:</strong> {recipe.username}</p>
                    <div className="separator"></div>

                    {recipe.videoLink ? (
                        <p><strong>Video Link:</strong> <a href={recipe.videoLink} target="_blank" rel="noopener noreferrer">Watch Video</a></p>
                    ) : (
                        <p><strong>Video Link:</strong> No video recipe</p>
                    )}
                    <p style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        {categories.map((category, index) => (
                            <div key={index} style={{ background: ' #393E46', borderRadius: '5px', padding: '5px', textAlign: 'center' } }>
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
                                    {hasReviewed ? (
                                        <>
                                            <button className="recipe-details-edit-button-review" onClick={handleEditReviewButtonClick}>Edit Review</button>
                                            <button className="recipe-details-delete-button-review" onClick={handleDeleteReviewButtonClick}>Delete Review</button>
                                        </>
                                    ) : (
                                        <button className="recipe-details-review-button" onClick={handleReviewButtonClick}>Post Review</button>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
            <div className="recipe-container-2">
                <h2>Method</h2>
                <p style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}>{recipe.method}</p>
            </div>

            <div className="recipe-container-3">
                <h2><strong>Ingredients</strong></h2>
                <ul >
                    {ingredients.map((ingredient, index) => (
                        <li key={index}>
                            {ingredient.name} - {getIngredientQuantity(ingredient.id)}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

export default RecipeDetails;
