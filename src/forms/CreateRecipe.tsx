import React, { useEffect, useRef, useState } from 'react';
import Recipe from '../interface/RecipeInterface';
import '../stylesheets/CreateRecipe.css';

interface CreateProps {
    onClose: () => void;
    updateUser: () => void;
    checkNotif: (id: number) => void;
}

const CreateRecipe: React.FC<CreateProps> = ({ onClose, updateUser, checkNotif }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState<Recipe>({
        id: 0,
        title: '',
        image: '',
        method: '',
        timeToCook: '',
        rating: 0,
        username: localStorage.getItem('username') || '',
        videoLink: '',
        ingredients_id: [],
        reviews_id: [],
        categories_id: []
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [ingredients, setIngredients] = useState<{ id: number, name: string }[]>([]);
    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
    const [ingredientQuantities, setIngredientQuantities] = useState<{ [key: number]: string }>({});
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [categoryLimitExceeded, setCategoryLimitExceeded] = useState(false);

    const [ingredientSearch, setIngredientSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');

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

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, setSelected: React.Dispatch<React.SetStateAction<number[]>>, isIngredient: boolean) => {
        const { options } = e.target;
        const selectedIds = Array.from(options)
            .filter(option => option.selected)
            .map(option => Number(option.value));

        const uniqueSelectedIds = Array.from(new Set(selectedIds));

        if (!isIngredient && selectedIds.length + selectedCategories.length > 6) {
            setCategoryLimitExceeded(true);
            return;
        } else {
            setCategoryLimitExceeded(false);
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

    const handleIngredientSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIngredientSearch(e.target.value);
    };

    const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategorySearch(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newRecipe = { ...formData };

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
                    const recipeData = await response.json();
                    const newRecipeId = recipeData.id;

                    console.log('Recipe created successfully!', newRecipeId);

                    // Now upload the image
                    if (selectedFile) {
                        const reader = new FileReader();
                        reader.onloadend = async () => {
                            const imageData = reader.result?.toString();

                            try {
                                const imageResponse = await fetch('http://localhost:8080/api/images/recipe/upload', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${token}`
                                    },
                                    body: JSON.stringify({
                                        id: newRecipeId,
                                        imageData: imageData
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

                        reader.readAsDataURL(selectedFile);
                    }

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
                        localStorage.setItem('user', JSON.stringify(userData));
                        updateUser();
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

    const filteredIngredients = ingredients.filter(ingredient =>
        ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
    );

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(categorySearch.toLowerCase())
    );

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
                        style={{ whiteSpace: 'pre-wrap' }}
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

                    <button type="submit" disabled={!isFormValid}>Create</button>
                </form>
            </div>
        </div>
    );
};

export default CreateRecipe;
