interface Review {
    id: number;
    user_id: number; // Changed to user ID
    recipe_id: number; // Changed to recipe ID
    description: string;
    rating: number;
    image: string;
}

export default Review;
