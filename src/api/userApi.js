export const fetchUserData = async (setUsers) => {
    try {
        const requestOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const response = await fetch('http://localhost:8080/api/users', requestOptions);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUsers(data);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}