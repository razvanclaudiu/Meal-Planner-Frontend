interface Recipe {
    id: number;
    title: string;
    image: string;
    method: string;
    timeToCook: string;
    rating: number;
    username: string;
    videoLink: string;
    ingredients_id: number[];
    reviews_id: number[];
    categories_id: number[];
}

export default Recipe;
