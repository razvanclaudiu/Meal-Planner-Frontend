import React, {useEffect, useState} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import User from '../interface/UserInterface'; // Import User interface
import '../stylesheets/Profile.css';
import Recipe from "../interface/RecipeInterface";
import RecipeComponent from "../components/RecipeComponent";
import user_icon from '../assets/images/user_icon.png';
import Review from "../interface/ReviewInterface";
import ReviewItem from "../components/ReviewItem";

interface ProfileProps {
    user: User | null;
    updateUser: () => void;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, updateUser,setIsLoggedIn }) => {
    const navigate = useNavigate();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);


    useEffect(() => {
        const fetchRecipes = async (userId: number) => {
            try {
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };

                const response = await fetch(`http://localhost:8080/api/recipes/user/${userId}`, requestOptions);
                if (!response.ok) {
                    throw new Error('Failed to fetch recipes');
                }
                const data = await response.json();
                setRecipes(data || []);
            } catch (error) {
                console.error('Error fetching recipes:', error);
            }
        };

        const fetchReviews = async (userId: number) => {
            try {
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                };

                const response = await fetch(`http://localhost:8080/api/reviews/user/${userId}`, requestOptions);
                if (!response.ok) {
                    throw new Error('Failed to fetch reviews');
                }
                const data = await response.json();
                setReviews(data || []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        }

        if (user) {
            fetchRecipes(user.id);
            fetchReviews(user.id);
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        localStorage.removeItem('userImage');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('userId');
        updateUser();
        setIsLoggedIn(false);
        navigate('/home');
    };

    const closeModal = () => {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.classList.remove('show');
        }
    };

    if (!user) {
        closeModal();
        return <Navigate to="/home" />;
    }

    const { recipes_id= [], reviews_id= [], name, image, username, title, level, experience, creationDate } = user;

    return (
        <div className="profile">
            <div className="profile-header">
                <h2>{name}</h2>
                <div>
                    <img src={`http://localhost:8080/api/images/user/${user.image}`} alt="Profile" onError={(e) => {
                        e.currentTarget.src = user_icon; }}/>
                </div>
                <div className="separator"></div>
                <div>
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Title:</strong> {title}</p>
                </div>
                <div className="separator"></div>
                <div>
                    <p><strong>Level:</strong> {level}</p>
                    <div className="progress-bar">
                        <div className="progress" style={{ width: `${experience}%` }}></div>
                    </div>
                </div>
                <div className="separator"></div>
                <div>
                    <p><strong>Member since:</strong> {new Date(creationDate).toLocaleDateString()}</p>
                </div>
                <div className="separator"></div>
                {user.username === localStorage.getItem("username") && <button className="log-out-button" onClick={handleLogout}>Logout</button>}
            </div>

            <div>
                <div className="profile-recipes">
                    {user.username === localStorage.getItem("username") ? (
                        <h3 className="section-title">My Recipes</h3>
                        ) : (
                        <h3 className="section-title">{user.username}'s Recipes</h3>
                    )}

                    <div className="recipe-list-profile">
                    {recipes.length > 0 ? (
                        recipes.map(recipe => (
                            <button
                                key={recipe.id}
                                className="recipe-item-profile"
                                onClick={() => {
                                    window.history.pushState(null, '', `/recipe/${recipe.id}`);
                                    window.dispatchEvent(new Event('popstate'));
                                }}
                            >
                                <RecipeComponent recipe={recipe} />
                            </button>
                        ))
                    ) : (
                        <p style={{color: '#aaa'}}>No recipes yet</p>
                    )}
                    </div>

                </div>

                <div className="profile-reviews">
                    {user.username === localStorage.getItem("username") ? (
                        <h3 className="section-title">My Reviews</h3>
                    ) : (
                        <h3 className="section-title">{user.username}'s Reviews</h3>
                    )}
                    <div className="review-list-profile">
                        <div className="review-list-profile2">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <button
                                    key={review.recipe_id}
                                    className="review-item-button"
                                    onClick={() => {
                                        window.history.pushState(null, '', `/recipe/${review.recipe_id}`);
                                        window.dispatchEvent(new Event('popstate'));
                                    }}
                                >
                                    <ReviewItem review={review}/>
                                </button>

                            ))
                        ) : (
                            <p>No reviews yet</p>
                        )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
