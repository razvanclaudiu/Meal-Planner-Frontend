import React, { useEffect, useState } from 'react';
import './stylesheets/App.css';
import './stylesheets/Recipe.css';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Awards from './pages/Awards';
import Login from './forms/Login'; // Import the Login component
import RecipeDetails from './pages/RecipeDetails'; // Import RecipeDetails component
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'; // Import Routes and Route from react-router-dom
import yellow_chef_hat from './assets/images/yellow_chef_hat.png';
import image_not_found from "./assets/images/image_not_found.png"; // Import image
import Recipe from "./interface/RecipeInterface";
import Profile from "./pages/Profile";
import CreateRecipe from "./forms/CreateRecipe";
import { fetchRecipeData } from "./api/recipeApi";
import Leaderboard from "./pages/Leaderboard";
import Award from "./interface/AwardInterface";
import { RecipeProvider, useRecipeContext } from "./context/RecipeProvider";
import User from "./interface/UserInterface";
import Notification from "./interface/NotificationInterface";
import welcome_aboard from "./assets/images/welcome_aboard.png";
import first_taste from "./assets/images/first_taste.png";
import recipe_developer from "./assets/images/recipe_developer.png";
import culinary_architect from "./assets/images/culinary_architect.png";
import taste_tester from "./assets/images/taste_tester.png";
import savory_critic from "./assets/images/savory_critic.png";
import epicurean_evaluator from "./assets/images/epicurean_evaluator.png";
import gourmet_judge from "./assets/images/gourmet_judge.png";
import star_chef from "./assets/images/star_chef.png";
import master_chef from "./assets/images/master_chef.png";
import cooking_enthusiast from "./assets/images/cooking_enthusiast.png";
import culinary_virtuoso from "./assets/images/culinary_virtuoso.png";
import gastronomy_guru from "./assets/images/gastronomy_guru.png";
import seasoned_member from "./assets/images/seasoned_member.png";
import veteran_cook from "./assets/images/veteran_cook.png";
import culinary_explorer from "./assets/images/culinary_explorer.png";
// @ts-ignore
import notificationSoundFile from './assets/sounds/award.mp3';
import Register from "./forms/Register";
import Category from "./interface/CategoryInterface";
import Ingredient from "./interface/IngredientInterface";
import {Simulate} from "react-dom/test-utils";
import select = Simulate.select;
import {fetchUserData} from "./api/userApi";


function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCreateRecipeForm, setShowCreateRecipeForm] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [awards, setAwards] = useState<Award[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationSound] = useState(new Audio(notificationSoundFile));
    const [categories, setCategories] = useState<Category[]>([]);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [filterCategories, setFilterCategories] = useState<number[]>([]);
    const [filterIngredients, setFilterIngredients] = useState<number[]>([]);
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false);
    const [categorySearch, setCategorySearch] = useState('');
    const [ingredientSearch, setIngredientSearch] = useState('');

    const { recipes, setRecipes, users, setUsers } = useRecipeContext();
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData(setUsers);
    },[showRegisterModal]);

    useEffect(() => {
        fetchRecipeData(setRecipes);
    }, [showCreateRecipeForm]);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        setUser(savedUser ? JSON.parse(savedUser) : null);
    }, [localStorage.getItem('semaphore')]);

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken');
        setIsLoggedIn(!!accessToken);
    }, [showLoginModal, showRegisterModal]);

    useEffect(() => {
        const fetchCategoriesAndIngredients = async () => {
            try {
                const categoriesResponse = await fetch('http://localhost:8080/api/categories');
                const ingredientsResponse = await fetch('http://localhost:8080/api/ingredients');

                if (!categoriesResponse.ok || !ingredientsResponse.ok) {
                    throw new Error('Failed to fetch categories or ingredients');
                }

                const categoriesData = await categoriesResponse.json();
                const ingredientsData = await ingredientsResponse.json();

                setCategories(categoriesData);
                setIngredients(ingredientsData);
            } catch (error) {
                console.error('Error fetching categories and ingredients:', error);
            }
        };

        fetchCategoriesAndIngredients();
    }, []);

    useEffect(() => {
        const fetchAwards = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/awards');
                if (!response.ok) throw new Error('Failed to fetch awards');
                const data = await response.json();
                setAwards(data);
            } catch (error) {
                console.error('Error fetching awards:', error);
            }
        };

        fetchAwards();
    }, []);

    useEffect(() => {

        const fetchRecipes = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/recipes/filter?categories=${filterCategories}&ingredients=${filterIngredients}`);
                if (!response.ok) throw new Error('Failed to fetch recipes');
                const data = await response.json();
                setRecipes(data);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        }

        fetchRecipes();
    }, [filterCategories, filterIngredients]);

    const checkNotif = async (id: number) => {
        try {
            const response = await fetch(`http://localhost:8080/api/notifications/user/${id}`);
            if (!response.ok) throw new Error('Failed to fetch notifications');
            const data = await response.json();
            setNotifications(data);
            data.forEach(async (notification: Notification, index: number) => {
                setTimeout(async () => {
                    await updateNotificationShown(notification.id, { ...notification, notificationShown: true });
                    playNotificationSound();
                }, 4000 * index);
            });
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const updateNotificationShown = async (id: number, notification: Notification) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                const response = await fetch(`http://localhost:8080/api/notifications/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(notification)
                });
                if (!response.ok) throw new Error('Failed to update notification');
                console.log('Notification updated successfully');
            } catch (error) {
                console.error('Error updating notification:', error);
            }
        }
    };

    const handleButtonClick = (route: string) => {
        setSearchTerm("");
        handleClearFilter();
        fetchRecipeData(setRecipes);
        navigate(route);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    const handleSearchKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {

            const fetchRecipes = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/recipes/search?keyword=${searchTerm}`);
                    if (!response.ok) throw new Error('Failed to fetch recipes');
                    const data = await response.json();
                    setRecipes(data);
                } catch (error) {
                    console.error('Error fetching recipes:', error);
                }
            };

            fetchRecipes();
            navigate("/recipes");
            const url = new URL(window.location.href);
            url.searchParams.set('search', searchTerm);
            window.history.pushState({}, '', url.toString());
        }
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>, setSelected: React.Dispatch<React.SetStateAction<number[]>>) => {

        const { options } = e.target;
        const selectedIds = Array.from(options)
            .filter(option => option.selected)
            .map(option => Number(option.value)); // Convert value to number

        const uniqueSelectedIds = Array.from(new Set(selectedIds));



        setSelected(prevSelected => {
            if(prevSelected.length === 1 && prevSelected[0] === uniqueSelectedIds[0]){
                return [];
            }
            const newSelected = prevSelected.filter(id => !uniqueSelectedIds.includes(id));
            const updatedUniqueSelectedIds = uniqueSelectedIds.filter(id => !prevSelected.includes(id));
            return [...newSelected, ...updatedUniqueSelectedIds];
        });
        setTimeout(() => {
            navigate("/recipes");
        }, 500);

    };

    const handleClearFilter = () => {
        setFilterCategories([]);
        setFilterIngredients([]);
    }



    const handleRegisterButtonClick = () => setShowRegisterModal(true);
    const handleLoginButtonClick = () => setShowLoginModal(true);
    const handleModalClose = () => {
        setShowRegisterModal(false);
        setShowLoginModal(false);
        setShowCreateRecipeForm(false);
    };
    const handleCreateRecipeButtonClick = () => setShowCreateRecipeForm(true);

    const playNotificationSound = () => {
        if (notificationSound.paused) {
            notificationSound.play().catch(error => console.error('Failed to play notification sound:', error));
        } else {
            notificationSound.currentTime = 0;
        }
    };

    const handleCategorySearchChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setCategorySearch(e.target.value);
    };

    const handleIngredientSearchChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setIngredientSearch(e.target.value);
    };

    const handleCategoryDropdownTrue = () => {
        setShowCategoryDropdown(true);
    };

    const handleCategoryDropdownFalse = () => {
        setShowCategoryDropdown(false);
        setCategorySearch('');
    };

    const handleIngredientDropdownTrue = () => {
        setShowIngredientDropdown(true);
        setIngredientSearch('');
    };

    const handleIngredientDropdownFalse = () => {
        setShowIngredientDropdown(false);
    };

    return (
        <div className="App">
            <div className="top-bar">
                <img src={yellow_chef_hat} alt="Chef Hat" className="chef-hat" />
                <h1 className="app-title">Munchie</h1>
                <input
                    type="text"
                    placeholder="Search Recipes"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyPress}
                    className="search-bar"
                />
                <div className="filter-section">
                    <div className="dropdown1" onMouseLeave={handleCategoryDropdownFalse}>
                        <div className="dropdown-header" onMouseEnter={handleCategoryDropdownTrue} >
                            Categories
                        </div>
                        {showCategoryDropdown && (
                            <div>
                                <input
                                    type="text"
                                    className="filter-search"
                                    placeholder="Search categories..."
                                    onChange={handleCategorySearchChange}
                                />
                                <select className="filter-select" multiple onChange={(e) => handleSelectChange(e, setFilterCategories)}>
                                    {categories
                                        .filter(category => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
                                        .map(category => (
                                            <option key={category.id} value={String(category.id)} selected={filterCategories.includes(category.id)}>
                                                {category.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}
                    </div>
                    <div className="dropdown2"  onMouseLeave={handleIngredientDropdownFalse}>
                        <div className="dropdown-header" onMouseEnter={handleIngredientDropdownTrue}>
                            Ingredients
                        </div>
                        {showIngredientDropdown && (
                            <div>
                                <input
                                    type="text"
                                    className="filter-search"
                                    placeholder="Search ingredients..."
                                    onChange={handleIngredientSearchChange}
                                />
                                <select className="filter-select" multiple onChange={(e) => handleSelectChange(e, setFilterIngredients)}>
                                    {ingredients
                                        .filter(ingredient => ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase()))
                                        .map(ingredient => (
                                            <option key={ingredient.id} value={String(ingredient.id)} selected={filterIngredients.includes(ingredient.id)}>
                                                {ingredient.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>
                {(filterCategories.length > 0 || filterIngredients.length > 0) && (
                    <button className="clear-filter-button" onClick={handleClearFilter}>
                        Clear Filter
                    </button>
                )}
                {isLoggedIn ? (
                    <>
                        <button className="create-button" onClick={handleCreateRecipeButtonClick}>
                            Create
                        </button>
                        <button className="profile-button" onClick={() => handleButtonClick(`/profile/${localStorage.getItem("userId")}`)}>
                            <img src={`http://localhost:8080/api/images/user/${localStorage.getItem('userImage')}`} alt="Profile" onError={(e) => {
                                e.currentTarget.src = image_not_found;
                            }} />
                        </button>
                    </>
                ) : (
                    <>
                        <button className="register-button" onClick={handleRegisterButtonClick}>Register</button>
                        <button className="log-in-button" onClick={handleLoginButtonClick}>Log In</button>
                    </>
                )}
            </div>

            {showRegisterModal && <Register onClose={handleModalClose} checkNotif={checkNotif} />}
            {showLoginModal && <Login onClose={handleModalClose} checkNotif={checkNotif} />}
            {showCreateRecipeForm && <CreateRecipe onClose={handleModalClose} checkNotif={checkNotif} />}

            {notifications.slice(0, notifications.length).map((notification, index) => (
                <div key={index} className="notifications" style={{ animationDelay: `${index * 4}s` }}>
                    <div className="notification">
                        <strong>Award Earned!</strong>
                        <img src={getAwardImage(notification.awardId)} alt="Award" />
                        <p>{getAwardName(notification.awardId)}</p>
                    </div>
                </div>
            ))}

            <div className="main-content">
                <div className="left-sidebar">
                    <button className="sidebar-button" onClick={() => handleButtonClick('/home')}>Home</button>
                    <button className="sidebar-button" onClick={() => handleButtonClick('/recipes')}>Recipes</button>
                    <button className="sidebar-button" onClick={() => handleButtonClick('/leaderboard')}>Leaderboard</button>
                    <button className="sidebar-button" onClick={() => handleButtonClick('/awards')}>Awards</button>
                </div>

                <div className="app-body">
                    <Routes>
                        <Route path="/" element={<Navigate to="/home" />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/recipes" element={<Recipes recipes={recipes} />} />
                        <Route path="/awards" element={<Awards awards={awards} user={user} />} />
                        <Route path="/leaderboard" element={<Leaderboard users={users}/>} />
                        {users.map((user: User) => (
                            <Route key={user.id} path={`/profile/${user.id}`} element={<Profile user={user} setIsLoggedIn={setIsLoggedIn} />} />
                        ))}
                        {recipes.map((recipe: Recipe) => (
                            <Route key={recipe.id} path={`/recipe/${recipe.id}`} element={<RecipeDetails recipe={recipe} checkNotif={checkNotif} />} />
                        ))}
                    </Routes>
                </div>
            </div>
        </div>
    );
}

const getAwardImage = (awardId: number) => {
    switch (awardId) {
        case 1: return welcome_aboard;
        case 2: return first_taste;
        case 3: return recipe_developer;
        case 4: return culinary_architect;
        case 5: return taste_tester;
        case 6: return savory_critic;
        case 7: return epicurean_evaluator;
        case 8: return gourmet_judge;
        case 9: return star_chef;
        case 10: return master_chef;
        case 11: return cooking_enthusiast;
        case 12: return culinary_virtuoso;
        case 13: return gastronomy_guru;
        case 14: return seasoned_member;
        case 15: return veteran_cook;
        case 16: return culinary_explorer;
        default: return '';
    }
};

const getAwardName = (awardId: number) => {
    switch (awardId) {
        case 1: return "Welcome Aboard";
        case 2: return "First Taste";
        case 3: return "Recipe Developer";
        case 4: return "Culinary Architect";
        case 5: return "Taste Tester";
        case 6: return "Savory Critic";
        case 7: return "Epicurean Evaluator";
        case 8: return "Gourmet Judge";
        case 9: return "Star Chef";
        case 10: return "Master Chef";
        case 11: return "Cooking Enthusiast";
        case 12: return "Culinary Virtuoso";
        case 13: return "Gastronomy Guru";
        case 14: return "Seasoned Member";
        case 15: return "Veteran Cook";
        case 16: return "Culinary Explorer";
        default: return '';
    }
};

export default () => (
    <RecipeProvider>
        <Router>
            <App />
        </Router>
    </RecipeProvider>
);
