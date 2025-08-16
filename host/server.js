// const express = require('express');
// const cors = require('cors');
// const { connectDB } = require('./database');
// const routes = require('./routes/access.js');
// const path = require('path');
//
// const server = express();
// const PORT = 3000;
//
// server.use(cors({
//     origin: true,
//     credentials: true
// }));
//
// server.use(express.json());
//
// server.use(express.static(path.join(__dirname, '../interface/base')));
//
// server.use('/api', routes); // Move API routes under /api
//
// server.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '../interface/base/index.html'));
// });
//
// const startServer = async () => {
//     try {
//         await connectDB();
//         server.listen(PORT, '0.0.0.0', () => {
//             console.log(`Server running on port ${PORT}`);
//         });
//     } catch (error) {
//         console.error('Failed to start host:', error);
//     }
// };
//
// startServer();

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