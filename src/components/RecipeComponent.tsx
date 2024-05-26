import React from 'react';
import image_not_found from '../assets/images/image_not_found.png';
import Recipe from "../interface/RecipeInterface";


interface Props {
    recipe: Recipe;
}

const RecipeComponent: React.FC<Props> = ({ recipe }) => {
    const imageUrl = `http://localhost:8080/api/images/recipe/${recipe.image}`;

    return (
        <div className="recipe">
            <img
                src={imageUrl}
                alt={recipe.title}
                onError={(e) => {
                    e.currentTarget.src = image_not_found;
                }}
            />
            <h2>{recipe.title}</h2>
        </div>
    );
}

export default RecipeComponent;
