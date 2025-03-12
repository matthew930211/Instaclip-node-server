import express from "express";
import mongoose from "mongoose";
import cors from "cors"
import dotenv from "dotenv";
import users from "./routes/user.route.js";
import webhooks from "./routes/webhook.route.js";
import assets from "./routes/asset.route.js";
import authRoutes from "./routes/auth.route.js";
import socialShareRoutes from "./routes/social-share.route.js";
import paymentRoutes from "./routes/payments.route.js";

dotenv.config();

const app = express();

// db connect
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Mongo DB Connected Successfully.");
    })
    .catch((err) => {
        console.log("Mongo DB Connection Error : ", err);
    })

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// routes 
app.use("/api/users", users);
app.use("/api/webhooks", webhooks);
app.use("/api/assets", assets);
app.use("/api/auth", authRoutes);
app.use("/api/social-share", socialShareRoutes);
app.use("/api/payments", paymentRoutes);


const port = process.env.PORT || 8000;

app.listen(port, () => {
    console.log(`server is running on port: ${port}`)
})