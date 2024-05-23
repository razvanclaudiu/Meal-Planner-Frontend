import React, { useEffect, useRef, useState } from 'react';
import '../stylesheets/Login.css';
import User from '../interface/UserInterface';
interface LoginProps {
    onClose: () => void; // Specify the type for onClose prop
    checkNotif: (id : number) => void;
}

function Login({ onClose, checkNotif }: LoginProps) {
    const modalRef = useRef<HTMLDivElement>(null); // Ref for the modal content
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Function to handle clicks outside the modal content
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose(); // Close the modal if the click is outside it
            }
        };

        // Add event listener when component mounts
        document.addEventListener('mousedown', handleClickOutside);

        // Cleanup function to remove event listener when component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other headers you need for CORS
                },
                body: JSON.stringify({ username, password }),
            };

            const response = await fetch('http://localhost:8080/api/auth/login', requestOptions);
            if (!response.ok) {
                throw new Error('Failed to log in');
            }

            const data = await response.json();
            const accessToken = data.accessToken;

            getUserData(username, accessToken);
        } catch (error) {
            setError('Failed to log in');
        }
    };

    const getUserData = async (username: string, accessToken: string) => {
        const url = `http://localhost:8080/api/users/username/${username}`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const userData = await response.json();
            // Save data in local storage and close modal
            localStorage.setItem('userImage', userData.image);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('username', username);
            localStorage.setItem("userId", userData.id);
            localStorage.setItem("semaphore", Math.random().toString());
            checkNotif(userData.id);
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content" ref={modalRef}> {/* Assign ref to the modal content */}
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="log-in-submit">Log In</button>
                </form>
            </div>
        </div>
    );
}

export default Login;
