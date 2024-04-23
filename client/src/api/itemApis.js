import axios from "axios";
const url = "http://localhost:5000/item";

export const createItem = (item) => axios.post(url, item);
export const getItemById = (id) => axios.get(`${url}/${id}`);
export const getItems = () => axios.get(url);
