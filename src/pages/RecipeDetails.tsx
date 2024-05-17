import React, { useEffect, useState } from 'react';
import '../stylesheets/RecipeDetails.css';
import Recipe from "../interface/RecipeInterface";
import StarRating from '../items/StarRating';
import image_not_found from "../images/image_not_found.png";

interface Props {
    recipe: Recipe;
}

const RecipeDetails: React.FC<Props> = ({ recipe }) => {
    const imageUrl = `http://localhost:8080/api/images/recipe/${recipe.image}`;
    const [categories, setCategories] = useState<string[]>([]);
    const [ingredients, setIngredients] = useState<string[]>([]);

    useEffect(() => {
        // Fetch categories and ingredients
        fetchCategories();
        fetchIngredients();
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

    function handleDeleteButtonClick(id: number) {
        
    }

    return (
        <>
            <div className="recipe-details-container">
                <img src={imageUrl} alt={recipe.title} className="recipe-image" onError={(e) => {
                    e.currentTarget.src = image_not_found; // Set a placeholder image
                }} />
                <div className="recipe-info">
                    <h2 className="recipe-title">{recipe.title}</h2>
                    <p> <StarRating rating={recipe.rating} /></p>
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
                            <div key={index} style={{ background: '#ffd53b', borderRadius: '5px', padding: '5px', textAlign: 'center' }}>
                                {category}
                            </div>
                        ))}
                    </p>
                    
                    <button className="recipe-details-edit-button" onClick={() => handleEditButtonClick(recipe.id)}>Edit</button>
                    <button className="recipe-details-delete-button" onClick={() => handleDeleteButtonClick(recipe.id)}>Delete</button>

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
