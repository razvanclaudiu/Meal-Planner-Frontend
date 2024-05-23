import React, { useEffect, useRef, useState } from 'react';
import '../stylesheets/Register.css';
import User from '../interface/UserInterface';
import {fetchRecipeData} from "../api/recipeApi";

interface RegisterProps {
    onClose: () => void;
    checkNotif: (id: number) => void;
}

function Register({ onClose, checkNotif }: RegisterProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            const imageTypes = ['image/jpeg', 'image/jpg'];

            if (imageTypes.includes(selectedFile.type)) {
                const imageName = selectedFile.name;
                setFormData(prevData => ({
                    ...prevData,
                    image: imageName // Store image name as a string
                }));
                setSelectedFile(selectedFile);
            } else {
                alert('Please select a valid image file (jpeg, jpg).');
            }
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            // Registration request
            const registerResponse = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!registerResponse.ok) {
                const errorText = await registerResponse.text();
                throw new Error(`Failed to register: ${errorText}`);
            }

            console.log('Registration successful:', await registerResponse.text());

            // Login request
            const { username, password } = formData;
            const loginResponse = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!loginResponse.ok) {
                throw new Error('Failed to log in');
            }

            const { accessToken } = await loginResponse.json();

            // Fetch user data
            const userResponse = await fetch(`http://localhost:8080/api/users/username/${username}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!userResponse.ok) {
                throw new Error('Failed to fetch user data');
            }

            const userData = await userResponse.json();

            // Save data in local storage
            localStorage.setItem('userImage', userData.image);
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('username', username);
            localStorage.setItem('userId', userData.id);
            localStorage.setItem("semaphore", Math.random().toString());

            checkNotif(userData.id);

            // Image upload if selected
            if (selectedFile) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const imageData = reader.result?.toString();
                    if (!imageData) {
                        console.error('Failed to read the selected file');
                        return;
                    }

                    try {
                        const imageResponse = await fetch(`http://localhost:8080/api/images/user/upload`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${accessToken}`,
                            },
                            body: JSON.stringify({
                                id: userData.username,
                                imageData: imageData,
                            }),
                        });

                        if (imageResponse.ok) {
                            console.log('File uploaded successfully');
                        } else {
                            console.error('Failed to upload file');
                        }
                    } catch (error) {
                        console.error('Error uploading file:', error);
                    }
                };

                reader.readAsDataURL(selectedFile);
            }

            // Close the modal on successful registration
            onClose();
        } catch (error) {
            let errorMessage = 'An unknown error occurred';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error && typeof error === 'object') {
                errorMessage = JSON.stringify(error);
            }

            console.error('Error during registration:', errorMessage);
            setError(errorMessage);
        }
    };


    return (
        <div className="modal">
            <div className="modal-content" ref={modalRef}>
                <h2>Register</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                    <label htmlFor="image">Image: <span className="required">*</span></label>
                    <input
                        type="file"
                        id="image"
                        name="image"
                        accept=".jpeg, .jpg"
                        onChange={handleImageChange}
                        required
                    />
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="register-submit">Register</button>
                </form>
            </div>
        </div>
    );
}

export default Register;
