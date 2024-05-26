// recipeContext.js

import React, { createContext, useContext, useState } from 'react';

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
    const [recipes, setRecipes] = useState([]);
    const [users, setUsers] = useState([]);

    return (
        <RecipeContext.Provider value={{ recipes, setRecipes, users, setUsers}}>
            {children}
        </RecipeContext.Provider>
    );
};

export const useRecipeContext = () => {
    return useContext(RecipeContext);
};
