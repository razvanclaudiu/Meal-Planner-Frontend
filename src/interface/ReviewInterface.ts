

interface Review {
    id: number;
    userId: number; // Changed to user ID
    recipeId: number; // Changed to recipe ID
    description: string;
    rating: number;
    image: string;
}

export default Review;
