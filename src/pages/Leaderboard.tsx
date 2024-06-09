import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import Navigate and useNavigate
import UserComponent from "../components/UserComponent";
import User from "../interface/UserInterface";
import '../stylesheets/Leaderboard.css';

interface LeaderboardProps {
    users: User[]; // Define prop for user data
}

const Leaderboard: React.FC<LeaderboardProps> = ({users}) => {
    const [sortBy, setSortBy] = useState<keyof User | null>("level");
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const navigate = useNavigate();

    const handleSort = (field: keyof User) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            if(field === "username" || field === "title")
                setSortOrder('asc');
            else setSortOrder('desc');
        }
    };

    const getArrowIcon = (field: keyof User) => {
        if (sortBy === field) {
            if(field === "username" || field === "title")
                return sortOrder === 'asc' ? '↓' : '↑';
            return sortOrder === 'asc' ? '↑' : '↓';
        }
        return null;
    };

    const handleUserClick = (userId: number) => {
        navigate(`/profile/${userId}`);
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (sortBy && a[sortBy] !== undefined && b[sortBy] !== undefined) {
            let aValue: any = a[sortBy];
            let bValue: any = b[sortBy];
            if (typeof aValue === 'string') aValue = aValue.toLowerCase();
            if (typeof bValue === 'string') bValue = bValue.toLowerCase();
            if (sortBy === 'awards_id' || sortBy === 'recipes_id' || sortBy === 'reviews_id') {
                aValue = aValue.length;
                bValue = bValue.length;
            }
            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return bValue < aValue ? -1 : bValue > aValue ? 1 : 0;
            }
        }
        return 0;
    });

    return (
        <div className="leaderboard-container">
            <h2 className="leaderboard-header">Leaderboard</h2>
            <p className="leaderboard-username" onClick={() => handleSort('username')}>
                Username {getArrowIcon('username')}
            </p>
            <p className="leaderboard-title" onClick={() => handleSort('title')}>
                Title {getArrowIcon('title')}
            </p>
            <p className="leaderboard-level" onClick={() => handleSort('level')}>
                Level {getArrowIcon('level')}
            </p>
            <p className="leaderboard-recipes" onClick={() => handleSort('recipes_id')}>
                Recipes {getArrowIcon('recipes_id')}
            </p>
            <p className="leaderboard-reviews" onClick={() => handleSort('reviews_id')}>
                Reviews {getArrowIcon('reviews_id')}
            </p>
            <p className="leaderboard-awards" onClick={() => handleSort('awards_id')}>
                Awards {getArrowIcon('awards_id')}
            </p>
            <div className="leaderboard-list">
                {sortedUsers.map(user => (
                    <button key={user.id} className="leaderboard-item" onClick={() => handleUserClick(user.id)}>
                        <UserComponent user={user} />
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Leaderboard;
