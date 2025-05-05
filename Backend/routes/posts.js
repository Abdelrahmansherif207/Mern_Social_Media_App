const express = require("express");
const router = express.Router();
const {
    createPost,
    getPosts,
    getPostById,
    updatePost,
    deletePost,
    reactToPost,
    addComment,
    deleteComment,
    getUserFeed,
} = require("../controllers/postController");
const { protect } = require("../middleware/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Post management and interactions
 */

/**
 * @swagger
 * /api/posts/feed:
 *   get:
 *     summary: Get a user's feed
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     description: Returns a list of posts from the authenticated user and users they follow.
 *     responses:
 *       200:
 *         description: Successfully retrieved the feed
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *       500:
 *         description: Server error
 */
router.get("/feed", protect, getUserFeed);

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - user
 *         - content
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the post
 *         user:
 *           type: object # Populated user info
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *             profilePicture:
 *               type: string
 *         content:
 *           type: string
 *           description: The textual content of the post
 *         image:
 *           type: string
 *           description: URL of the image associated with the post
 *         reactions:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               emoji:
 *                 type: string
 *               user:
 *                  type: string # User ID
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               text:
 *                 type: string
 *               user:
 *                 type: object # Populated user info
 *                 properties:
 *                    _id:
 *                      type: string
 *                    username:
 *                      type: string
 *                    profilePicture:
 *                      type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The time the post was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The time the post was last updated
 *     AuthResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         profilePicture:
 *           type: string
 *         token:
 *           type: string
 *           description: JWT token for authentication
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// CRUD Routes
/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Text content of the post
 *               image:
 *                 type: string
 *                 description: Optional URL for an image
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request (e.g., missing content)
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get a list of posts (feed)
 *     tags: [Posts]
 *     parameters:
 *      - in: query
 *        name: limit
 *        schema:
 *           type: integer
 *           default: 50
 *        description: Maximum number of posts to return
 *      - in: query
 *        name: page
 *        schema:
 *           type: integer
 *           default: 1
 *        description: Page number for pagination (Not fully implemented in controller yet)
 *     responses:
 *       200:
 *         description: A list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Server error
 */
router
    .route("/")
    .post(protect, createPost) // Protect route: Only logged-in users can create posts
    .get(getPosts); // Public route: Anyone can view posts (adjust if needed)

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: New text content for the post
 *               image:
 *                 type: string
 *                 description: New image URL for the post
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request (e.g., invalid ID)
 *       401:
 *         description: Unauthorized (not the author)
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       401:
 *         description: Unauthorized (not the author)
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router
    .route("/:id")
    .get(getPostById) // Public route: Anyone can view a single post
    .put(protect, updatePost) // Protect route: Only the author can update
    .delete(protect, deletePost); // Protect route: Only the author can delete

// Reaction Routes
/**
 * @swagger
 * /api/posts/{id}/react:
 *   post:
 *     summary: Add or remove a reaction to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 description: The emoji character to react with
 *     responses:
 *       200:
 *         description: Reaction added/removed/updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request (e.g., missing emoji)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.route("/:id/react").post(protect, reactToPost);

// Comment Routes
/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: The text content of the comment
 *     responses:
 *       201:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post' # Returns the updated post
 *       400:
 *         description: Bad request (e.g., missing text)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Post not found
 *       500:
 *         description: Server error
 */
router.route("/:id/comments").post(protect, addComment);

/**
 * @swagger
 * /api/posts/{id}/comments/{comment_id}:
 *   delete:
 *     summary: Delete a comment from a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *       - in: path
 *         name: comment_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post' # Returns the updated post
 *       401:
 *         description: Unauthorized (not comment author or post author)
 *       404:
 *         description: Post or comment not found
 *       500:
 *         description: Server error
 */
router.route("/:id/comments/:comment_id").delete(protect, deleteComment);

module.exports = router;
