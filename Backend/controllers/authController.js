const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const asyncHandler = require("express-async-handler");

// Utility function to generate JWT
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Token expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
// Single register function with inline validation
const register = asyncHandler(async (req, res) => {
    const { username, email, password, profilePicture } = req.body;

    // Validations
    if (!username) {
        res.status(400);
        throw new Error("Username is required");
    }
    if (!email) {
        res.status(400);
        throw new Error("Email is required");
    }
    if (!password) {
        res.status(400);
        throw new Error("Password is required");
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
        return res
            .status(400)
            .json({ message: "Email is already registered!" });
    }

    try {
        const user = await User.create({
            username,
            email,
            password,
            profilePicture,
        });

        // Generate token
        const token = generateToken(user._id);

        console.log("Generated token:", token);

        // Send response
        return res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            profilePicture: user.profilePicture || null,
            token,
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Something went wrong" });
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            user: user,
            token: token,
        });
    } catch (error) {
        console.error("Login Error:", error.message);
        res.status(500).json({ message: "Server error during login" });
    }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
        return res
            .status(400)
            .json({ message: "Please provide both current and new passwords" });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({
            message: "New password must be at least 6 characters long",
        });
    }

    if (currentPassword === newPassword) {
        return res.status(400).json({
            message: "New password cannot be the same as the current password",
        });
    }

    try {
        const user = await User.findById(userId).select("+password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.password) {
            return res.status(400).json({
                message:
                    "Cannot change password for accounts signed in with Google",
            });
        }

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch) {
            return res
                .status(401)
                .json({ message: "Incorrect current password" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Change Password Error:", error.message);
        res.status(500).json({
            message: "Server error while changing password",
        });
    }
};

// @desc    Logout user (conceptual - client removes token)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
    res.status(200).json({ message: "Logout successful" });
};

// @desc    Authenticate user using Google ID Token
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res) => {
    const { tokenId } = req.body;

    if (!tokenId) {
        return res.status(400).json({ message: "Google token ID is required" });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
        console.error("GOOGLE_CLIENT_ID not set in .env file.");
        return res.status(500).json({ message: "Server configuration error" });
    }

    try {
        // Verify the token ID with Google
        const ticket = await client.verifyIdToken({
            idToken: tokenId,
            audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if user already exists with this Google ID
        let user = await User.findOne({ googleId });

        if (user) {
            // User exists, log them in
            const token = generateToken(user._id);
            res.status(200).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture,
                token: token,
            });
        } else {
            // User does not exist with Google ID, check by email
            user = await User.findOne({ email });

            if (user) {
                // User exists with this email but used a different login method (e.g., password)
                // Option 1: Link Google ID (requires careful handling, maybe confirmation)
                // Option 2: Return error suggesting login via original method
                // For simplicity, returning an error here:
                return res.status(400).json({
                    message: `Email already registered. Please log in using your original method.`,
                });
            } else {
                // No user found with this Google ID or email, create a new user
                // Generate a simple username from the name or email
                let baseUsername =
                    name.replace(/\s+/g, "").toLowerCase() ||
                    email.split("@")[0];
                let username = baseUsername;
                let counter = 1;
                // Ensure username uniqueness
                while (await User.findOne({ username })) {
                    username = `${baseUsername}${counter}`;
                    counter++;
                }

                const newUser = new User({
                    googleId,
                    email,
                    username,
                    profilePicture: picture,
                    // No password needed for Google login
                });

                await newUser.save();
                const token = generateToken(newUser._id);

                res.status(201).json({
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    profilePicture: newUser.profilePicture,
                    token: token,
                });
            }
        }
    } catch (error) {
        console.error("Google Login Error:", error.message);
        // Handle token verification errors specifically
        if (
            error.message.includes("Invalid token signature") ||
            error.message.includes("Token used too late") ||
            error.message.includes("Wrong recipient")
        ) {
            return res
                .status(401)
                .json({ message: "Invalid or expired Google token" });
        }
        res.status(500).json({ message: "Server error during Google login" });
    }
};

// @desc    Get current logged-in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: "followers",
                select: "username profilePicture followers following",
                populate: [
                    {
                        path: "followers",
                        select: "username profilePicture",
                    },
                    {
                        path: "following",
                        select: "username profilePicture",
                    },
                ],
            })
            .populate({
                path: "following",
                select: "username profilePicture followers following",
                populate: [
                    {
                        path: "followers",
                        select: "username profilePicture",
                    },
                    {
                        path: "following",
                        select: "username profilePicture",
                    },
                ],
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const transformUser = (user) => ({
            _id: user._id,
            username: user.username,
            profilePicture: user.profilePicture,
            followers: user.followers?.map((f) => transformUser(f)) || [],
            following: user.following?.map((f) => transformUser(f)) || [],
        });

        res.status(200).json({
            success: true,
            data: {
                user: {
                    ...transformUser(user),
                    email: user.email,
                    coverPicture: user.coverPicture,
                    bio: user.bio,
                    location: user.location,
                    website: user.website,
                    createdAt: user.createdAt,
                    followersCount: user.followersCount,
                    followingCount: user.followingCount,
                },
            },
        });
    } catch (error) {
        console.error("Error in getMe controller:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching user data",
        });
    }
};

module.exports = {
    register,
    login: exports.login,
    changePassword: exports.changePassword,
    logout: exports.logout,
    googleLogin: exports.googleLogin,
    getMe: exports.getMe,
};
