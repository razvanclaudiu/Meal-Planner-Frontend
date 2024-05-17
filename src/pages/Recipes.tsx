import React from 'react';
import '../stylesheets/Recipe.css';
import Recipe from "../interface/RecipeInterface";
import RecipeItem from "../items/RecipeItem";


interface Props {
    recipes: Recipe[];
}

const Recipes: React.FC<Props> = ({ recipes }) => {

    return (
        <div className="recipe-container">
            <div className="recipe-list">
                {recipes.map(recipe => (
                    <button
                        key={recipe.id}
                        className="recipe-item"
                        onClick={() => {
                            window.history.pushState(null, '', `/recipe/${recipe.id}`);
                            window.dispatchEvent(new Event('popstate'));
                        }}
                    >
                        <RecipeItem recipe={recipe} />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Recipes;
