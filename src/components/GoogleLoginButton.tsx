// src/components/GoogleLoginButton.tsx
import React from 'react';
import { GoogleLogin, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';
import axios from 'axios';

interface GoogleLoginProps {
    onClose: () => void; // Specify the type for onClose prop
    updateUser: () => void;
    checkNotif: (id : number) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginProps> = ( {onClose, updateUser, checkNotif}) => {
    const handleSuccess = async (response: CredentialResponse) => {
        try {
            if (response.credential) {
                // Send the token to your backend for validation and login
                const token = response.credential;

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add any other headers you need for CORS
                    },
                    body: JSON.stringify({ token }),
                };

                const result = await fetch('http://localhost:8080/api/auth/oauth2/login', requestOptions);

                const data = await result.json();
                const accessToken = data.accessToken;
                const username = data.username;

                console.log(username);

                getUserData(username, accessToken);

                console.log(result);
                // Handle successful login response from your backend
            }
        } catch (error) {
            console.error('Login failed', error);
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
            localStorage.setItem('userImage', userData.image); // Save profile picture URL
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('username', username);
            localStorage.setItem("userId", userData.id);
            updateUser();
            checkNotif(userData.id);
            onClose(); // Close the modal
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handleError = () => {
        console.error('Login error');
    };

    return (
        <GoogleOAuthProvider clientId="212995299860-o09tlc21bi1f5dajkoppptltgvmc91va.apps.googleusercontent.com">
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
            />
        </GoogleOAuthProvider>
    );
};

export default GoogleLoginButton;
