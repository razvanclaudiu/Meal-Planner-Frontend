import React from 'react';
import '../stylesheets/Recipe.css';
import Recipe from "../interface/RecipeInterface";
import RecipeComponent from "../components/RecipeComponent";


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
                        <RecipeComponent recipe={recipe} />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Recipes;
