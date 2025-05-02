const express = require("express");
const router = express.Router();
const {
    register,
    login,
    changePassword,
    logout,
    googleLogin,
    getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         username:
 *           type: string
 *           description: Username
 *         email:
 *           type: string
 *           format: email
 *           description: User's email
 *         profilePicture:
 *           type: string
 *           description: URL of the profile picture
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *     ChangePasswordRequest:
 *        type: object
 *        required:
 *          - currentPassword
 *          - newPassword
 *        properties:
 *          currentPassword:
 *            type: string
 *            format: password
 *          newPassword:
 *            type: string
 *            format: password
 *     GoogleLoginRequest:
 *        type: object
 *        required:
 *          - tokenId
 *        properties:
 *          tokenId:
 *            type: string
 *            description: Google ID token
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login, and password management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               profilePicture:
 *                 type: string
 *                 format: url
 *                 description: Optional URL of the profile picture hosted online
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request (e.g., validation error, user exists)
 *       500:
 *         description: Server error
 */
router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                     profilePicture:
 *                       type: string
 *                     coverPicture:
 *                       type: string
 *                     bio:
 *                       type: string
 *                     location:
 *                       type: string
 *                     website:
 *                       type: string
 *                     followers:
 *                       type: array
 *                       items:
 *                         type: string
 *                     following:
 *                       type: array
 *                       items:
 *                         type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/change-password:
 *   put:
 *     summary: Change the logged-in user's password
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: The user's current password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The desired new password (min 6 characters)
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad request (e.g., missing fields, new password too short)
 *       401:
 *         description: Unauthorized (e.g., incorrect current password, invalid token)
 *       500:
 *         description: Server error
 */
router.put("/change-password", protect, changePassword);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out the current user (conceptual - client removes token)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful (client should remove token)
 *       401:
 *         description: Unauthorized (invalid token)
 */
router.post("/logout", protect, logout);

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Authenticate or register a user using Google ID Token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tokenId
 *             properties:
 *               tokenId:
 *                 type: string
 *                 description: Google ID Token obtained from frontend Google Sign-In
 *     responses:
 *       200:
 *         description: Google login successful (existing user)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       201:
 *         description: Google registration successful (new user created)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Bad request (e.g., missing tokenId, email already registered via password)
 *       401:
 *         description: Unauthorized (invalid Google token)
 *       500:
 *         description: Server error
 */
router.post("/google", googleLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user's profile data (excluding password)
 *         content:
 *           application/json:
 *             schema:
 *               # You might want to define a User schema similar to UserProfile
 *               # but without followers/following, or just reuse UserProfile if appropriate
 *               $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized (invalid or missing token)
 *       404:
 *         description: User not found (token valid, but user deleted)
 *       500:
 *         description: Server error
 */
router.get("/me", protect, getMe);

// TODO: Add route for Google Login later

module.exports = router;
