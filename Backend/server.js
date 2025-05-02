require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const userRoutes = require("./routes/users"); // Import user routes
// TODO: Import other routes (users, etc.) later

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Swagger Configuration
const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "Social Media API",
            version: "1.0.0",
            description: "API documentation for the social media application",
            contact: {
                name: "Your Name/Org", // Optional: Add your name
                // url: "Your Website", // Optional: Add your website
                // email: "Your Email" // Optional: Add your email
            },
            servers: [
                {
                    url: `http://localhost:${PORT}`, // Adjust if deployed elsewhere
                },
            ],
        },
        components: {
            // Define security scheme globally
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [
            {
                bearerAuth: [], // Apply bearerAuth globally to all operations that define security
            },
        ],
    },
    // Path to the API docs
    // Note: Uses glob pattern to include all route files
    apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
// TODO: Mount other routes here

// Basic Route
app.get("/", (req, res) => {
    res.redirect("/api-docs");
});

// TODO: Add API Routes here

// Connect to MongoDB
mongoose
    .connect(process.env.MONGODB_URI, {
        //   useNewUrlParser: true, // These options are deprecated in newer Mongoose versions
        //   useUnifiedTopology: true,
    })
    .then(() => {
        console.log("MongoDB Connected...");
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
            console.log(
                `API Documentation available at http://localhost:${PORT}/api-docs`
            );
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
        process.exit(1); // Exit process with failure
    });
