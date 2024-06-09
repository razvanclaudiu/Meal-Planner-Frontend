interface User {
    id: number;
    username: string;
    password: string;
    level: number;
    experience: number;
    reviews_id: number[];
    recipes_id: number[];
    awards_id: number[];
    name: string;
    creationDate: Date;
    image: string;
    title: string;
}

export default User;
