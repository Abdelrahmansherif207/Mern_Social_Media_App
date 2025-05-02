const express = require("express");
const router = express.Router();
const {
    getUserProfile,
    followUser,
    unfollowUser,
    searchUsers,
    updateUserProfile,
    deleteUser,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search for users by username or email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: The username or email to search for
 *     responses:
 *       200:
 *         description: A list of matching users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "643fe9ec8f3c9a001e812345"
 *                   username:
 *                     type: string
 *                     example: "john_doe"
 *                   profilePicture:
 *                     type: string
 *                     example: "https://i.ibb.co/some-image.jpg"
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error while searching for users
 */
router.get("/search", protect, searchUsers);
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profiles and follow/unfollow actions
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserProfile:
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
 *         coverPicture:
 *           type: string
 *         bio:
 *           type: string
 *         location:
 *           type: string
 *         website:
 *           type: string
 *         followers:
 *           type: array
 *           items:
 *              $ref: '#/components/schemas/UserReference'
 *         following:
 *           type: array
 *           items:
 *              $ref: '#/components/schemas/UserReference'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserReference:
 *        type: object
 *        properties:
 *           _id:
 *             type: string
 *           username:
 *             type: string
 *           profilePicture:
 *             type: string
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/:id", getUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user's profile
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               name: "John Doe"
 *               email: "john@example.com"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       403:
 *         description: Unauthorized to update this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/:id", protect, updateUserProfile);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user account
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User account deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User account deleted successfully"
 *       403:
 *         description: Unauthorized to delete this user
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", protect, deleteUser);

/**
 * @swagger
 * /api/users/{id}/follow:
 *   put:
 *     summary: Follow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed user
 *       400:
 *         description: Bad request (e.g., cannot follow self, already following)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.put("/:id/follow", protect, followUser);

/**
 * @swagger
 * /api/users/{id}/unfollow:
 *   put:
 *     summary: Unfollow a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to unfollow
 *     responses:
 *       200:
 *         description: Successfully unfollowed user
 *       400:
 *         description: Bad request (e.g., cannot unfollow self, not following)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put("/:id/unfollow", protect, unfollowUser);

// Optional: Add routes for getting followers/following lists
// router.get('/:id/followers', getFollowers);
// router.get('/:id/following', getFollowing);

module.exports = router;
