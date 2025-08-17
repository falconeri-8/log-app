const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const server = express();
const PORT = process.env.PORT || 3000;

server.use(cors(
    {
        origin: true,
        credentials: true
    }
));

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, '../interface/base')));

mongoose.connect(process.env.DATABASE || "mongodb://localhost:27017/log-interface", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to Mongo"))
    .catch((err) => console.log("Database connection error: ", err));

const accessRoutes = require("./routes/access.js")
const authorRoutes = require("./routes/author.js")
const profileRoutes = require("./routes/profile.js")

server.use("/api/access", accessRoutes)
// server.use("/api/authors", authorRoutes)
server.use("/api/profiles", profileRoutes)

server.listen(PORT, () => {
    console.log("Server listening on port: " + PORT)
})