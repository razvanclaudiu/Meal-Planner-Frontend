import React from 'react';
import User from "../interface/UserInterface";
import '../stylesheets/Leaderboard.css';

interface UserProps {
    user: User;
}

const UserComponent: React.FC<UserProps> = ({ user }) => {
    const imageUrl = `http://localhost:8080/api/images/user/${user.image}`;

    return (
        <div className="user-container">
            <img src={imageUrl} alt="User" className="user-image" />
                <div className="user-details">
                    <p className="user-component-username">{user.username}</p>
                    <p className="user-component-title">{user.title}</p>
                    <p className="user-component-level"> {user.level}</p>
                    <p className="user-component-awards">{user.awards_id.length}</p>
                    <p className="user-component-recipes">{user.recipes_id.length}</p>
                    <p className="user-component-reviews">{user.reviews_id.length}</p>
                </div>
        </div>
    );
};

export default UserComponent;
