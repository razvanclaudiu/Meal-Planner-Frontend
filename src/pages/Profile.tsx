import React, {useEffect, useState} from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import User from '../interface/UserInterface'; // Import User interface
import '../stylesheets/Profile.css';
import Recipe from "../interface/RecipeInterface";
import RecipeItem from "../items/RecipeItem";

interface ProfileProps {
    user: User | null; // Define prop for user data
    setIsLoggedIn: (isLoggedIn: boolean) => void; // Function to set isLoggedIn state
}

const Profile: React.FC<ProfileProps> = ({ user,setIsLoggedIn }) => {
    const navigate = useNavigate(); // Get the navigate function
    const [recipes, setRecipes] = useState<Recipe[]>([]);

    useEffect(() => {
        const fetchRecipes = async (userId: number) => {
            try {
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any other headers you need for CORS
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
                // Handle error, maybe show a message to the user
            }
        };

        if (user) {
            fetchRecipes(user.id); // Fetch recipes when the user data is available
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('username');
        localStorage.removeItem('userImage');
        localStorage.removeItem('accessToken');
        setIsLoggedIn(false); // Set isLoggedIn to false
        navigate('/home'); // Redirect to home
    };

    // Close login modal if open
    const closeModal = () => {
        const modal = document.querySelector('.modal');
        if (modal) {
            modal.classList.remove('show'); // Assuming there's a CSS class named 'show' to display the modal
        }
    };

    if (!user) {
        closeModal(); // Close modal if it's open
        return <Navigate to="/home" />;
    }

    // Provide default values for user properties
    const { recipeIds = [], reviewIds = [], name, image, username, title, level, experience, creationDate } = user;

    return (
        <div className="profile">
            <div className="profile-header">
                <h2>{name}</h2>
                <div>
                    <img src={`http://localhost:8080/api/images/user/${localStorage.getItem("userImage")}`} alt="Profile" />
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
                <button className="log-out-button" onClick={handleLogout}>Logout</button>
            </div>

            <div>
                <div className="profile-recipes">
                    <h3 className="section-title">My Recipes</h3>
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
                                <RecipeItem recipe={recipe} />
                            </button>
                        ))
                    ) : (
                        <p>Loading recipes...</p>
                    )}
                    </div>

                </div>
                <div className="profile-reviews">
                    <h3 className="section-title">My Reviews</h3>
                    {reviewIds.length > 0 ? (
                        reviewIds.map((reviewId, index) => (
                            <p key={index}>Review ID: {reviewId}</p>
                        ))
                    ) : (
                        <p>No reviews available</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
