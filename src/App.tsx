import React, { useEffect, useState } from 'react';
import './stylesheets/App.css';
import './stylesheets/Recipe.css';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Awards from './pages/Awards';
import Login from './pages/Login'; // Import the Login component
import RecipeDetails from './pages/RecipeDetails'; // Import RecipeDetails component
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import Routes and Route from react-router-dom
import yellow_chef_hat from './images/yellow_chef_hat.png';
import image_not_found from "./images/image_not_found.png"; // Import image
import Recipe from "./interface/RecipeInterface";
import Profile from "./pages/Profile";
import CreateRecipe from "./pages/CreateRecipe";
import {fetchRecipeData} from "./api/recipeApi";
import { RecipeProvider } from './context/RecipeProvider';
import { useRecipeContext} from "./context/RecipeProvider";


function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCreateRecipeForm, setShowCreateRecipeForm] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if user is logged in


    const { recipes, setRecipes } = useRecipeContext()

    useEffect(() => {
        fetchRecipeData(setRecipes);
    }, [showCreateRecipeForm]); // Empty dependency array means this effect runs only once, on component mount

    useEffect(() => {
        // Check if there is an access token in local storage
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [showLoginModal]); // Run the effect whenever showLoginModal changes

    useEffect(() => {
        const fetchRecipes = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/recipes/search?keyword=${searchTerm}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recipes');
                }
                const data = await response.json();
                setRecipes(data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };

        fetchRecipes();
    }, [searchTerm]);

    const handleButtonClick = (route: string) => {
        window.history.pushState(null, '', route);
        window.dispatchEvent(new Event('popstate'));
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleButtonClick('/recipes');
            const url = new URL(window.location.href);
            url.searchParams.set('search', searchTerm);
            window.history.pushState({}, '', url.toString());
        }
    };

    const handleLoginButtonClick = () => {
        setShowLoginModal(true);
    };

    const handleModalClose = () => {
        setShowLoginModal(false);
        setShowCreateRecipeForm(false);
    };

    const handleCreateRecipeButtonClick = () => {
        setShowCreateRecipeForm(true);
    };

    return (
        <div className="App">
            <div className="top-bar">
                <img src={yellow_chef_hat} alt={"Chef Hat"} className="chef-hat" />
                <h1 className="app-title">Munchie</h1>
                <input
                    type="text"
                    placeholder="Search Recipes"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyPress}
                    className="search-bar"
                />
                {isLoggedIn ? (
                    <>
                        <button className="create-button"  onClick={handleCreateRecipeButtonClick}>
                            Create
                        </button>
                        <button className="profile-button" onClick={() => handleButtonClick('/profile')}>
                            {/* Fetch the image tag from the API */}
                            <img src={`http://localhost:8080/api/images/user/${localStorage.getItem('userImage')}`} alt="Profile" onError={(e) => {
                                e.currentTarget.src = image_not_found; }}/>
                        </button>
                    </>
                ) : (
                    <button className="log-in-button" onClick={handleLoginButtonClick}>Log In</button>
                )}
            </div>

            {showLoginModal && (
                <Login onClose={handleModalClose} />
            )}

            {showCreateRecipeForm && <CreateRecipe onClose={handleModalClose}/>}

            <Router>
                <div className="main-content">
                    <div className="left-sidebar">
                        <button className="sidebar-button" onClick={() => handleButtonClick('/home')}>Home</button>
                        <button className="sidebar-button" onClick={() => handleButtonClick('/recipes')}>Recipes</button>
                        <button className="sidebar-button" onClick={() => handleButtonClick('/awards')}>Awards</button>
                    </div>

                    <header className="App-header">
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/recipes" element={<Recipes recipes={recipes} />} />
                            <Route path="/recipes?search=:searchTerm" element={<Recipes recipes={recipes} />} />
                            <Route path="/awards" element={<Awards />} />
                            <Route
                                path="/profile"
                                element={<Profile user={JSON.parse(localStorage.getItem('user') || 'null')} setIsLoggedIn={setIsLoggedIn}/>}
                            />

                            {recipes.map((recipe: Recipe) => (
                                <Route key={recipe.id} path={`/recipe/${recipe.id}`} element={<RecipeDetails recipe={recipe} />} />
                            ))}
                        </Routes>
                    </header>
                </div>
            </Router>
        </div>
    );
}

export default () => {
    return (
        <RecipeProvider>
            <App />
        </RecipeProvider>
    );
}