import express from "express";
import { getAllConfs, getConfByName } from "../controller/conf.js";

const confRouter = express.Router();

confRouter.get("/", getAllConfs);
confRouter.get("/:name", getConfByName);

export default confRouter;
