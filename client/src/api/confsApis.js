import axios from "axios";
const url = "http://localhost:5000/conf";

export const getAllConfs = () => axios.get(url);
export const getConfByName = (name) => axios.get(`${url}/${name}`);
