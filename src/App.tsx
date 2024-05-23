import React, { useEffect, useState } from 'react';
import './stylesheets/App.css';
import './stylesheets/Recipe.css';
import Home from './pages/Home';
import Recipes from './pages/Recipes';
import Awards from './pages/Awards';
import Login from './forms/Login'; // Import the Login component
import RecipeDetails from './pages/RecipeDetails'; // Import RecipeDetails component
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Import Routes and Route from react-router-dom
import yellow_chef_hat from './images/yellow_chef_hat.png';
import image_not_found from "./images/image_not_found.png"; // Import image
import Recipe from "./interface/RecipeInterface";
import Profile from "./pages/Profile";
import CreateRecipe from "./forms/CreateRecipe";
import {fetchRecipeData} from "./api/recipeApi";
import Leaderboard from "./pages/Leaderboard";
import Award from "./interface/AwardInterface";
import {RecipeProvider, useRecipeContext} from "./context/RecipeProvider";
import User from "./interface/UserInterface";
import Notification from "./interface/NotificationInterface";
import welcome_aboard from "./images/welcome_aboard.png";
import first_taste from "./images/first_taste.png";
import recipe_developer from "./images/recipe_developer.png";
import culinary_architect from "./images/culinary_architect.png";
import taste_tester from "./images/taste_tester.png";
import savory_critic from "./images/savory_critic.png";
import epicurean_evaluator from "./images/epicurean_evaluator.png";
import gourmet_judge from "./images/gourmet_judge.png";
import star_chef from "./images/star_chef.png";
import master_chef from "./images/master_chef.png";
import cooking_enthusiast from "./images/cooking_enthusiast.png";
import culinary_virtuoso from "./images/culinary_virtuoso.png";
import gastronomy_guru from "./images/gastronomy_guru.png";
import seasoned_member from "./images/seasoned_member.png";
import veteran_cook from "./images/veteran_cook.png";
import culinary_explorer from "./images/culinary_explorer.png";
// @ts-ignore
import notificationSoundFile from './sounds/award.mp3';
import Register from "./forms/Register";


function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCreateRecipeForm, setShowCreateRecipeForm] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track if user is logged in
    const [awards, setAwards] = useState<Award[]>([]); // State to store awards
    const [user, setUser] = useState<User | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [notificationSound] = useState(new Audio(notificationSoundFile));

    const { recipes, setRecipes } = useRecipeContext();

    useEffect(() => {
        fetchRecipeData(setRecipes);
    }, [showCreateRecipeForm]); // Dependency array means this effect runs only once, on component mount

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    }, [localStorage.getItem('semaphore')]);


    const checkNotif = (id : number) => {
            setNotifications([]);
            const fetchNotifications = async () => {
                try {
                    const response = await fetch(`http://localhost:8080/api/notifications/user/${id}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch notifications');
                    }
                    const data = await response.json();
                    setNotifications(data);
                    setTimeout(() => {
                        // Update notificationShown for each notification
                        data.forEach(async (notification : Notification, index : number) => {
                            setTimeout(async () => {
                                await updateNotificationShown(notification.id, { ...notification, notificationShown: true });
                                playNotificationSound();
                            }, 4000 * (index));
                        });
                    },1000);

                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };

            fetchNotifications();
        };


    useEffect(() => {
        const fetchAwards = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/awards');
                if (!response.ok) {
                    throw new Error('Failed to fetch awards');
                }
                const data = await response.json();
                setAwards(data);
            } catch (error) {
                console.error('Error fetching awards:', error);
            }
        };

        fetchAwards();
    }, []); // Empty dependency array means this effect runs only once, on component mount


    useEffect(() => {
        // Check if there is an access token in local storage
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [showLoginModal, showRegisterModal]); // Run the effect whenever showLoginModal changes

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

    const updateNotificationShown = async (id : number, notification : Notification) => {
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
                if (!response.ok) {
                    throw new Error('Failed to update notification');
                }
                const updatedNotification = await response.json();
                console.log('Notification updated successfully:', updatedNotification);
            } catch (error) {
                console.error('Error updating notification:', error);
            }
        }
    };

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

    function handleRegisterButtonClick() {
        setShowRegisterModal(true);
    }

    const handleLoginButtonClick = () => {
        setShowLoginModal(true);
    };

    const handleModalClose = () => {
        setShowRegisterModal(false);
        setShowLoginModal(false);
        setShowCreateRecipeForm(false);
    };

    const handleCreateRecipeButtonClick = () => {
        setShowCreateRecipeForm(true);
    };

    const playNotificationSound = () => {
        if (notificationSound.paused) {
            notificationSound.play().catch(error => console.error('Failed to play notification sound:', error));
        } else {
            notificationSound.currentTime = 0;
        }
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
                        <button className="create-button" onClick={handleCreateRecipeButtonClick}>
                            Create
                        </button>
                        <button className="profile-button" onClick={() => handleButtonClick('/profile')}>
                            {/* Fetch the image tag from the API */}
                            <img src={`http://localhost:8080/api/images/user/${localStorage.getItem('userImage')}`} alt="Profile" onError={(e) => {
                                e.currentTarget.src = image_not_found; }}/>
                        </button>
                    </>
                ) : (
                    <>
                        <button className="register-button" onClick={handleRegisterButtonClick}>Register</button>
                        <button className="log-in-button" onClick={handleLoginButtonClick}>Log In</button>
                    </>
                )}
            </div>

            {showRegisterModal && (
                <Register onClose={handleModalClose} checkNotif={checkNotif}/>
            )}

            {showLoginModal && (
                <Login onClose={handleModalClose} checkNotif={checkNotif}/>
            )}

            {showCreateRecipeForm && <CreateRecipe onClose={handleModalClose}  checkNotif={checkNotif}/>}

            {notifications.slice(0, notifications.length).map((notification, index) => (
                <div key={index} className="notifications" style={{ animationDelay: `${index * 4}s` }}>
                    <div className="notification">
                        <strong>Award Earned!</strong>
                        {notification.awardId === 1 && <img src={welcome_aboard} alt="Award" />}
                        {notification.awardId === 2 && <img src={first_taste} alt="Award" />}
                        {notification.awardId === 3 && <img src={recipe_developer} alt="Award" />}
                        {notification.awardId === 4 && <img src={culinary_architect} alt="Award" />}
                        {notification.awardId === 5 && <img src={taste_tester} alt="Award" />}
                        {notification.awardId === 6 && <img src={savory_critic} alt="Award" />}
                        {notification.awardId === 7 && <img src={epicurean_evaluator} alt="Award" />}
                        {notification.awardId === 8 && <img src={gourmet_judge} alt="Award" />}
                        {notification.awardId === 9 && <img src={star_chef} alt="Award" />}
                        {notification.awardId === 10 && <img src={master_chef} alt="Award" />}
                        {notification.awardId === 11 && <img src={cooking_enthusiast} alt="Award" />}
                        {notification.awardId === 12 && <img src={culinary_virtuoso} alt="Award" />}
                        {notification.awardId === 13 && <img src={gastronomy_guru} alt="Award" />}
                        {notification.awardId === 14 && <img src={seasoned_member} alt="Award" />}
                        {notification.awardId === 15 && <img src={veteran_cook} alt="Award" />}
                        {notification.awardId === 16 && <img src={culinary_explorer} alt="Award" />}
                        <p>
                            {notification.awardId === 1 && "Welcome Aboard"}
                            {notification.awardId === 2 && "First Taste"}
                            {notification.awardId === 3 && "Recipe Developer"}
                            {notification.awardId === 4 && "Culinary Architect"}
                            {notification.awardId === 5 && "Taste Tester"}
                            {notification.awardId === 6 && "Savory Critic"}
                            {notification.awardId === 7 && "Epicurean Evaluator"}
                            {notification.awardId === 8 && "Gourmet Judge"}
                            {notification.awardId === 9 && "Star Chef"}
                            {notification.awardId === 10 && "Master Chef"}
                            {notification.awardId === 11 && "Cooking Enthusiast"}
                            {notification.awardId === 12 && "Culinary Virtuoso"}
                            {notification.awardId === 13 && "Gastronomy Guru"}
                            {notification.awardId === 14 && "Seasoned Member"}
                            {notification.awardId === 15 && "Veteran Cook"}
                            {notification.awardId === 16 && "Culinary Explorer"}
                        </p>

                    </div>
                </div>

            ))}

            <Router>
                <div className="main-content">
                    <div className="left-sidebar">
                        <button className="sidebar-button" onClick={() => handleButtonClick('/home')}>Home</button>
                        <button className="sidebar-button" onClick={() => handleButtonClick('/recipes')}>Recipes</button>
                        <button className="sidebar-button" onClick={() => handleButtonClick('/leaderboard')}>Leaderboard</button>
                        <button className="sidebar-button" onClick={() => handleButtonClick('/awards')}>Awards</button>
                    </div>

                    <header className="App-header">
                        <Routes>
                            <Route path="/" element={<Navigate to="/home" />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/recipes" element={<Recipes recipes={recipes} />} />
                            <Route path="/recipes?search=:searchTerm" element={<Recipes recipes={recipes} />} />
                            <Route path="/awards" element={<Awards awards={awards} user={user} />} />
                            <Route path="/leaderboard" element={<Leaderboard />} />
                            <Route
                                path="/profile"
                                element={<Profile user={JSON.parse(localStorage.getItem('user') || 'null')} setIsLoggedIn={setIsLoggedIn} />}
                            />

                            {recipes.map((recipe: Recipe) => (
                                <Route key={recipe.id} path={`/recipe/${recipe.id}`} element={<RecipeDetails recipe={recipe} checkNotif={checkNotif}/>} />
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
