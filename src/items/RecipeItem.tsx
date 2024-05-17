import React from 'react';
import image_not_found from '../images/image_not_found.png';

interface Recipe {
    id: number;
    title: string;
    image: string;
}

interface Props {
    recipe: Recipe;
}

const RecipeItem: React.FC<Props> = ({ recipe }) => {
    const imageUrl = `http://localhost:8080/api/images/recipe/${recipe.image}`;

    return (
        <div className="recipe">
            <img
                src={imageUrl}
                alt={recipe.title}
                onError={(e) => {
                    e.currentTarget.src = image_not_found; // Set a placeholder image
                }}
            />
            <p>{recipe.title}</p>
        </div>
    );
}

export default RecipeItem;
