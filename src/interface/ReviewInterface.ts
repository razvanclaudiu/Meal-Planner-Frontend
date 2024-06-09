interface Review {
    id: number;
    user_id: number;
    recipe_id: number;
    description: string;
    rating: number;
    image: string;
}

export default Review;
