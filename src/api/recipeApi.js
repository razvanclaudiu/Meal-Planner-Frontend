export const fetchRecipeData = async (setRecipes) => {
    try {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers you need for CORS
            }
        };

        const response = await fetch('http://192.168.0.228:8080/api/recipes', requestOptions);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setRecipes(data);
    } catch (error) {
        console.error('Error fetching recipes:', error);
        // Handle the error as needed
    }
};