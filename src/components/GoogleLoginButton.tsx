import React from 'react';
import { GoogleLogin, GoogleOAuthProvider, CredentialResponse } from '@react-oauth/google';

interface GoogleLoginProps {
    onClose: () => void;
    updateUser: () => void;
    checkNotif: (id : number) => void;
}

const GoogleLoginButton: React.FC<GoogleLoginProps> = ( {onClose, updateUser, checkNotif}) => {
    const handleSuccess = async (response: CredentialResponse) => {
        try {
            if (response.credential) {
                const token = response.credential;

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
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
            localStorage.setItem('userImage', userData.image);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('username', username);
            localStorage.setItem("userId", userData.id);
            updateUser();
            checkNotif(userData.id);
            onClose();
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
