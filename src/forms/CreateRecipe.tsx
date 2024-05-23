import React, { useEffect, useRef, useState } from 'react';
import Recipe from '../interface/RecipeInterface';
import '../stylesheets/CreateRecipe.css';
import {fetchRecipeData} from "../api/recipeApi";

interface CreateProps {
    onClose: () => void;
    checkNotif: (id : number) => void;
}

const CreateRecipe: React.FC<CreateProps> = ({ onClose, checkNotif }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<Recipe>({
        id: 0,
        title: '',
        image: '', // Store image name as a string
        method: '',
        timeToCook: '',
        rating: 0,
        username: localStorage.getItem('username') || '', // This will be replaced with user ID
        videoLink: '',
        ingredients_id: [],
        reviews_id: [],
        categories_id: []
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [ingredients, setIngredients] = useState<{ id: number, name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [categoryLimitExceeded, setCategoryLimitExceeded] = useState(false); // Add state for category limit

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
                const imageName = selectedFile.name;
                setFormData(prevData => ({
                    ...prevData,
                    image: imageName // Store image name as a string
                }));
                setSelectedFile(selectedFile);
            } else {
                alert('Please select a valid image file (jpeg, jpg).');
            }
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, setSelected: React.Dispatch<React.SetStateAction<number[]>>) => {
        const { options } = e.target;
        const selectedIds = Array.from(options)
            .filter(option => option.selected)
            .map(option => Number(option.value)); // Convert value to number

        if (e.target.name === 'categories_id' && selectedIds.length + selectedCategories.length > 6) {
            setCategoryLimitExceeded(true); // Set limit exceeded flag
            return;
        } else {
            setCategoryLimitExceeded(false); // Reset limit exceeded flag if under limit
        }

        setSelected(prevSelected => [...prevSelected, ...selectedIds]);

        if (e.target.name === 'ingredients_id') {
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

    const handleDeselect = (id: number, setSelected: React.Dispatch<React.SetStateAction<number[]>>) => {
        setSelected(prevSelected => prevSelected.filter(itemId => itemId !== id));
        setFormData(prevData => ({
            ...prevData,
            [selectedIngredients.includes(id) ? 'ingredients_id' : 'categories_id']: prevData[selectedIngredients.includes(id) ? 'ingredients_id' : 'categories_id'].filter(itemId => itemId !== id)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newRecipe = { ...formData };

        // Clear form data
        setFormData({
            id: 0,
            title: '',
            image: '',
            method: '',
            timeToCook: '',
            rating: 0,
            username: '',
            videoLink: '',
            ingredients_id: [],
            reviews_id: [],
            categories_id: []
        });

        const token = localStorage.getItem('accessToken');

        if (token) {
            try {
                const response = await fetch('http://localhost:8080/api/recipes', {
                    method: 'POST',
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

                    const url = `http://localhost:8080/api/users/username/${localStorage.getItem("username")}`;

                    try {
                        const response = await fetch(url, {});
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const userData = await response.json();
                        // Save data in local storage and close modal
                        localStorage.setItem('user', JSON.stringify(userData));
                        checkNotif(userData.id);
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
        <div className="create-modal">
            <div className="create-modal-content" ref={modalRef}>
                <h2>New Recipe</h2>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="title">Title: <span className="required">*</span></label>
                    <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} />

                    <label htmlFor="image">Image: <span className="required">*</span></label>
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
                    <div className="select-container">
                        <select id="ingredients_id" name="ingredients_id" multiple value={selectedIngredients.map(String)} onChange={(e) => handleSelectChange(e, setSelectedIngredients)}>
                            {ingredients.map(ingredient => (
                                <option key={ingredient.id} value={ingredient.id}>{ingredient.name}</option>
                            ))}
                        </select>
                        <div className="selected-box">
                            {selectedIngredients.map(id => (
                                <div key={id} className="selected-item" onClick={() => handleDeselect(id, setSelectedIngredients)}>
                                    {ingredients.find(ingredient => ingredient.id === id)?.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <label htmlFor="categories_id">Categories: <span className="required">*</span></label>
                    <div className="select-container">
                        <select id="categories_id" name="categories_id" multiple value={selectedCategories.map(String)} onChange={(e) => handleSelectChange(e, setSelectedCategories)}>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        <div className="selected-box">
                            {selectedCategories.map(id => (
                                <div key={id} className="selected-item" onClick={() => handleDeselect(id, setSelectedCategories)}>
                                    {categories.find(category => category.id === id)?.name}
                                </div>
                            ))}
                        </div>
                        {categoryLimitExceeded && <p className="error-message">You can only select up to 6 categories.</p>} {/* Display error message */}
                    </div>

                    <label htmlFor="videoLink">Video Link:</label>
                    <input type="text" id="videoLink" name="videoLink" value={formData.videoLink} onChange={handleChange} />

                    <button type="submit" disabled={!isFormValid}>Create</button>
                </form>
            </div>
        </div>
    );
};

export default CreateRecipe;
