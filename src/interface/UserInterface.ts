interface User {
    id: number;
    username: string;
    password: string;
    level: number;
    experience: number;
    reviews_id: number[]; // Changed to review IDs
    recipes_id: number[]; // Changed to recipe IDs
    awards_id: number[]; // Changed to award IDs
    name: string;
    creationDate: Date;
    image: string;
    title: string;
}

export default User;
