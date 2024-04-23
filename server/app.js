import express from "express";
import cors from "cors";
import confRouter from "./router/conf.js";
import itemRouter from "./router/item.js";

const PORT = 5000;

const app = express();

app.use(express.json());
app.use(cors());
app.use("/conf", confRouter);
app.use("/item", itemRouter);

app.listen(PORT, () => console.log(`Listening to port ${PORT}`));
