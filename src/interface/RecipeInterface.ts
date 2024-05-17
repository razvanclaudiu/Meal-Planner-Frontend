interface Recipe {
    id: number;
    title: string;
    image: string;
    method: string; // Changed from description
    timeToCook: string;
    rating: number;
    username: string; // Changed to user ID
    videoLink: string;
    ingredients_id: number[];
    reviews_id: number[]; // Changed to review IDs
    categories_id: number[];
}

export default Recipe;
