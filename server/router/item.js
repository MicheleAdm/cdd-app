import express from "express";
import { postItemByConf, getItems, getItemById } from "../controller/item.js";

const itemRouter = express.Router();

itemRouter.post("/", postItemByConf);
itemRouter.get("/", getItems);
itemRouter.get("/:id", getItemById);

export default itemRouter;
