import express from "express";
import morgan from "morgan";
import authRouter from "./route/auth.route.js";
import postRouter from "./route/post.route.js";
import orgRouter from "./route/org.route.js";

const app = express();

// ? Explore express.urlencoded - Todo
// app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use(morgan("dev"));

app.use('/api/auth', authRouter);
app.use('/api/post', postRouter);
app.use('/api/org', orgRouter);

export default app;