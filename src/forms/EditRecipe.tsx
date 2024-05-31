import React, { useEffect, useRef, useState } from 'react';
import Recipe from '../interface/RecipeInterface';
import '../stylesheets/CreateRecipe.css';
import {useRecipeContext} from "../context/RecipeProvider";
import {fetchRecipeData} from "../api/recipeApi";

interface EditProps {
    recipe: Recipe;
    onClose: () => void;
}

const EditRecipe: React.FC<EditProps> = ({ recipe, onClose }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<Recipe>({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image, // Store image name as a string
        method: recipe.method,
        timeToCook: recipe.timeToCook,
        rating: recipe.rating,
        username: recipe.username, // This will be replaced with user ID
        videoLink: recipe.videoLink,
        ingredients_id: recipe.ingredients_id,
        reviews_id: recipe.reviews_id,
        categories_id: recipe.categories_id
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [ingredients, setIngredients] = useState<{ id: number, name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>(recipe.ingredients_id);
    const [ingredientQuantities, setIngredientQuantities] = useState<{ [key: number]: string }>({});
    const [selectedCategories, setSelectedCategories] = useState<number[]>(recipe.categories_id);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [categoryLimitExceeded, setCategoryLimitExceeded] = useState(false); // Add state for category limit
    const [ingredientSearch, setIngredientSearch] = useState(''); // Ingredient search state
    const [categorySearch, setCategorySearch] = useState(''); // Category search state

    const { setRecipes } = useRecipeContext();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ingredientsResponse = await fetch('http://localhost:8080/api/ingredients');
                if (ingredientsResponse.ok) {
                    const ingredientsData = await ingredientsResponse.json();
                    setIngredients(ingredientsData);
                } else {
                    console.error('Failed to fetch ingredients:', ingredientsResponse.statusText);
                }

                const categoriesResponse = await fetch('http://localhost:8080/api/categories');
                if (categoriesResponse.ok) {
                    const categoriesData = await categoriesResponse.json();
                    setCategories(categoriesData);
                } else {
                    console.error('Failed to fetch categories:', categoriesResponse.statusText);
                }

                const quantityResponse = await fetch(`http://localhost:8080/api/quantities/recipe/${recipe.id}`);
                if (quantityResponse.ok) {
                        const data = await quantityResponse.json();
                        for (let i = 0; i < data.length; i++) {
                            setIngredientQuantities(prevQuantities => ({
                                ...prevQuantities,
                                [data[i].ingredientId]: data[i].quantity
                            }));
                        }
                } else {
                    console.error("Error fetching quantities:", quantityResponse.statusText);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const { title, image, method, timeToCook, ingredients_id, categories_id } = formData;
        const ingredientsValid = ingredients_id.length > 0;
        const categoriesValid = categories_id.length > 0;

        if (title && image && method && timeToCook && ingredientsValid && categoriesValid) {
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

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, setSelected: React.Dispatch<React.SetStateAction<number[]>>, isIngredient: boolean) => {
        const { options } = e.target;
        const selectedIds = Array.from(options)
            .filter(option => option.selected)
            .map(option => Number(option.value)); // Convert value to number

        const uniqueSelectedIds = Array.from(new Set(selectedIds));

        if (!isIngredient && selectedIds.length + selectedCategories.length > 6) {
            setCategoryLimitExceeded(true); // Set limit exceeded flag
            return;
        } else {
            setCategoryLimitExceeded(false); // Reset limit exceeded flag if under limit
        }

        setSelected(prevSelected => [...prevSelected, ...uniqueSelectedIds]);

        if (isIngredient) {
            setFormData(prevData => ({
                ...prevData,
                ingredients_id: [...prevData.ingredients_id, ...selectedIds]
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                categories_id: [...prevData.categories_id, ...selectedIds]
            }));
        }
    };

    const handleDeselect = (id: number, setSelected: React.Dispatch<React.SetStateAction<number[]>>, isIngredient: boolean) => {
        setSelected(prevSelected => prevSelected.filter(itemId => itemId !== id));

        setFormData(prevData => ({
            ...prevData,
            [isIngredient ? 'ingredients_id' : 'categories_id']: prevData[isIngredient ? 'ingredients_id' : 'categories_id'].filter(itemId => itemId !== id)
        }));

        if (isIngredient) {
            setIngredientQuantities(prevQuantities => {
                const { [id]: _, ...rest } = prevQuantities;
                return rest;
            });
        }
    };

    const handleQuantityChange = (ingredientId: number, quantity: string) => {
        setIngredientQuantities(prevQuantities => ({
            ...prevQuantities,
            [ingredientId]: quantity
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newRecipe = { ...formData };

        const token = localStorage.getItem('accessToken');

        if (token) {
            try {
                const response = await fetch(`http://localhost:8080/api/recipes/${newRecipe.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newRecipe)
                });

                if (response.ok) {
                    const recipeData = await response.json(); // Get the newly created recipe data
                    const newRecipeId = recipeData.id; // Get the ID of the newly created recipe

                    console.log('Recipe created successfully!', newRecipeId);

                    // Now upload the image
                    if (selectedFile) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                            const imageData = reader.result?.toString(); // Convert to base64 string

                            try {
                                const imageResponse = await fetch('http://localhost:8080/api/images/recipe/upload', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        id: newRecipeId, // Send the recipe ID
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

                    const responseD = await fetch(`http://localhost:8080/api/quantities/recipe/${recipe.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if(responseD.ok) {
                        // Submit quantities
                        const quantityPromises = selectedIngredients.map(ingredientId => {
                            const quantity = ingredientQuantities[ingredientId];
                            return fetch('http://localhost:8080/api/quantities', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    id: 0,
                                    recipeId: newRecipeId,
                                    ingredientId: ingredientId,
                                    quantity: quantity
                                })
                            });
                        });


                        await Promise.all(quantityPromises);

                        const url = `http://localhost:8080/api/users/username/${localStorage.getItem("username")}`;

                        try {
                            const response = await fetch(url, {});
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            const userData = await response.json();
                            // Save data in local storage and close modal
                            localStorage.setItem('user', JSON.stringify(userData));
                        }
                        catch (error) {
                            console.error('Error fetching user data:', error);
                        }
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
        fetchRecipeData(setRecipes);
        onClose();
    };

    const handleIngredientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIngredientSearch(e.target.value);
    };

    const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorySearch(e.target.value);
    };

    const filteredIngredients = ingredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
    );

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

    return (
        <div className="create-modal">
            <div className="create-modal-content" ref={modalRef}>
                <h2>Edit Recipe</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Title: <span className="required">*</span></label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} />

                    <label htmlFor="image">Image: </label>
                    <input type="file" id="image" name="image" accept=".jpeg, .jpg" onChange={handleImageChange} />

                    <label htmlFor="timeToCook">Time to Cook: <span className="required">*</span></label>
                    <input type="text" id="timeToCook" name="timeToCook" value={formData.timeToCook} onChange={handleChange} />

                    <label htmlFor="method">Method: <span className="required">*</span></label>
                    <textarea
                        id="method"
                        name="method"
                        value={formData.method}
                        onChange={handleChange}
                        style={{ whiteSpace: 'pre-wrap' }} // Add this style to preserve spaces
                    ></textarea>

                    <label htmlFor="ingredients_id">Ingredients: <span className="required">*</span></label>
                    <input type="text" placeholder="Search ingredients" value={ingredientSearch} onChange={handleIngredientSearch} /> {/* Ingredient search input */}
                    <div className="select-container">
                        <select className="selector" id="ingredients_id" name="ingredients_id" multiple value={selectedIngredients.map(String)} onChange={(e) => handleSelectChange(e, setSelectedIngredients, true)}>
                            {filteredIngredients.map(ingredient => (
                                !selectedIngredients.includes(ingredient.id) && (
                                    <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                                )
                            ))}
                        </select>
                        <div className="selected-box">
                            {selectedIngredients.map(id => (
                                <div key={id} className="selected-item">
                                    {ingredients.find(ingredient => ingredient.id === id)?.name}
                                    <input
                                        type="text"
                                        placeholder="Enter quantity"
                                        value={ingredientQuantities[id] || ''}
                                        onChange={(e) => handleQuantityChange(id, e.target.value)}
                                    />
                                    <button type="button" onClick={() => handleDeselect(id, setSelectedIngredients, true)}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <label htmlFor="categories_id">Categories: <span className="required">*</span></label>
                    <input type="text" placeholder="Search categories" value={categorySearch} onChange={handleCategorySearch} /> {/* Category search input */}
                    <div className="select-container">
                        <select className="selector" id="categories_id" name="categories_id" multiple value={selectedCategories.map(String)} onChange={(e) => handleSelectChange(e, setSelectedCategories, false)}>
                            {filteredCategories.map(category => (
                                !selectedCategories.includes(category.id) && (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                )
                            ))}
                        </select>
                        <div className="selected-box">
                            {selectedCategories.map(id => (
                                <div key={id} className="selected-item">
                                    {categories.find(category => category.id === id)?.name}
                                    <button type="button" onClick={() => handleDeselect(id, setSelectedCategories, false)}>Remove</button>
                                </div>
                            ))}
                        </div>
                        {categoryLimitExceeded && <p className="error-message">You can only select up to 6 categories.</p>} {/* Display error message */}
                    </div>

                    <label htmlFor="videoLink">Video Link:</label>
                    <input type="text" id="videoLink" name="videoLink" value={formData.videoLink} onChange={handleChange} />

                    <button type="submit" disabled={!isFormValid}>Submit Edit</button>
                </form>
            </div>
        </div>
    );
};

export default EditRecipe;
