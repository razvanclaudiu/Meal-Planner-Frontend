interface User {
    id: number;
    username: string;
    password: string;
    level: number;
    experience: number;
    reviewIds: number[]; // Changed to review IDs
    recipeIds: number[]; // Changed to recipe IDs
    awardIds: number[]; // Changed to award IDs
    name: string;
    creationDate: Date;
    image: string;
    title: string;
}

export default User;
