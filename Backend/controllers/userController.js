const User = require("../models/User");
const Post = require("../models/Post");
const asyncHandler = require("express-async-handler");
// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate("followers", "username profilePicture")
            .populate("following", "username profilePicture");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Get User Profile Error:", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        res.status(500).json({
            message: "Server error while fetching user profile",
        });
    }
};
// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private`
exports.updateUserProfile = async (req, res) => {
    try {
        const currUser = req.user;
        const userToUpdate = await User.findById(req.params.id);
        if (!userToUpdate)
            return res.status(404).json({ message: "User not found" });
        if (currUser._id.toString() !== userToUpdate._id.toString())
            return res.status(403).json({ message: "UnAuthorized" });

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res
            .status(200)
            .json({ message: "Updated Successfully", data: updatedUser });
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .json({ message: "Server error while updating user profile" });
    }
};
// @desc    Follow a user
// @route   PUT /api/users/:id/follow
// @access  Private
exports.followUser = async (req, res) => {
    const userIdToFollow = req.params.id;
    const currentUserId = req.user._id;

    try {
        if (!userIdToFollow || !currentUserId) {
            return res.status(400).json({ message: "Missing user IDs" });
        }

        if (userIdToFollow === currentUserId.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot follow yourself" });
        }

        const [userToFollow, currentUser] = await Promise.all([
            User.findById(userIdToFollow),
            User.findById(currentUserId),
        ]);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (currentUser.following.includes(userIdToFollow)) {
            return res
                .status(400)
                .json({ message: "Already following this user" });
        }

        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: userIdToFollow },
        });

        await User.findByIdAndUpdate(userIdToFollow, {
            $addToSet: { followers: currentUserId },
        });

        return res.status(200).json({
            message: `Successfully followed ${userToFollow.username}`,
            user: {
                username: userToFollow.username,
                _id: userToFollow._id,
            },
        });
    } catch (error) {
        console.error("Follow User Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        return res.status(500).json({
            message: "Server error while trying to follow user",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

// @desc    Unfollow a user
// @route   PUT /api/users/:id/unfollow
// @access  Private
exports.unfollowUser = async (req, res) => {
    const userIdToUnfollow = req.params.id;
    const currentUserId = req.user._id;

    try {
        if (!userIdToUnfollow || !currentUserId) {
            return res.status(400).json({ message: "Missing user IDs" });
        }

        if (userIdToUnfollow === currentUserId.toString()) {
            return res
                .status(400)
                .json({ message: "You cannot unfollow yourself" });
        }

        const [userToUnfollow, currentUser] = await Promise.all([
            User.findById(userIdToUnfollow),
            User.findById(currentUserId),
        ]);

        if (!userToUnfollow || !currentUser) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.following.includes(userIdToUnfollow)) {
            return res
                .status(400)
                .json({ message: "You are not following this user" });
        }

        await Promise.all([
            User.findByIdAndUpdate(currentUserId, {
                $pull: { following: userIdToUnfollow },
            }),
            User.findByIdAndUpdate(userIdToUnfollow, {
                $pull: { followers: currentUserId },
            }),
        ]);

        return res.status(200).json({
            message: `Successfully unfollowed ${userToUnfollow.username}`,
        });
    } catch (error) {
        console.error("Unfollow User Error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        return res.status(500).json({
            message: "Server error while trying to unfollow user",
            error:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : undefined,
        });
    }
};

// @desc Search users
// @route GET /api/users/search?query=searchTerm
// @access private
exports.searchUsers = async (req, res) => {
    const searchTerm = req.query.query;
    const currentUserId = req.user._id;
    try {
        const users = await User.find({
            $or: [
                { username: { $regex: searchTerm, $options: "i" } },
                { email: { $regex: searchTerm, $options: "i" } },
            ],
            _id: { $ne: currentUserId },
        }).select("username profilePicture followers following");

        res.status(200).json(users);
    } catch (error) {
        console.error("Search Users Error:", error.message);
        res.status(500).json({
            message: "Server error while searching for users",
        });
    }
};

// @desc Delete user Acc
// @route DELETE /api/users/:id
// @access private
exports.deleteUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (req.user.id !== user.id.toString()) {
        res.status(403);
        throw new Error("Not authorized to delete this user");
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account deleted successfully" });
});
