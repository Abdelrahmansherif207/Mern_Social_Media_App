const Post = require("../models/Post");
const User = require("../models/User");

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res) => {
    const { content, image } = req.body;

    if (!content) {
        return res
            .status(400)
            .json({ message: "Post content cannot be empty" });
    }

    try {
        const newPost = new Post({
            content,
            image: image || "",
            user: req.user._id,
        });

        const post = await newPost.save();
        await post.populate("user", "username profilePicture");

        res.status(201).json(post);
    } catch (error) {
        console.error("Create Post Error:", error.message);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (val) => val.message
            );
            return res.status(400).json({ message: messages.join(". ") });
        }
        res.status(500).json({ message: "Server error while creating post" });
    }
};

// @desc    Get all posts (e.g., for a feed)
// @route   GET /api/posts
// @access  Public (or Private depending on your feed logic)
exports.getPosts = async (req, res) => {
    try {
        // Basic feed: Get latest posts, populate author info
        // Add pagination later if needed
        const posts = await Post.find()
            .populate("user", "username profilePicture")
            .populate({
                path: "comments.user", // Populate user info within comments
                select: "username profilePicture",
            })
            .sort({ createdAt: -1 }) // Sort by newest first
            .limit(50); // Limit the number of posts fetched

        res.status(200).json(posts);
    } catch (error) {
        console.error("Get Posts Error:", error.message);
        res.status(500).json({ message: "Server error while fetching posts" });
    }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate("user", "username profilePicture")
            .populate({
                path: "comments.user",
                select: "username profilePicture",
            });

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error("Get Post By ID Error:", error.message);

        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({ message: "Server error while fetching post" });
    }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (only the author can update)
exports.updatePost = async (req, res) => {
    const { content, image } = req.body;

    // Basic validation
    if (content !== undefined && !content.trim()) {
        return res.status(400).json({ message: "Content cannot be empty" });
    }

    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res
                .status(401)
                .json({ message: "User not authorized to update this post" });
        }

        if (content !== undefined) post.content = content;
        if (image !== undefined) post.image = image;

        const updatedPost = await post.save();
        await updatedPost.populate("user", "username profilePicture");

        res.status(200).json(updatedPost);
    } catch (error) {
        console.error("Update Post Error:", error.message);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map(
                (val) => val.message
            );
            return res.status(400).json({ message: messages.join(". ") });
        }
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({ message: "Server error while updating post" });
    }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (only the author can delete)
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res
                .status(401)
                .json({ message: "User not authorized to delete this post" });
        }

        await post.deleteOne();
        res.status(200).json({ message: "Post removed successfully" });
    } catch (error) {
        console.error("Delete Post Error:", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({ message: "Server error while deleting post" });
    }
};

// @desc    Add or remove a reaction to a post
// @route   POST /api/posts/:id/react
// @access  Private
exports.reactToPost = async (req, res) => {
    const { emoji } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!emoji) {
        return res.status(400).json({ message: "Emoji is required to react" });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const reactionIndex = post.reactions.findIndex(
            (reaction) =>
                reaction.user.toString() === userId.toString() &&
                reaction.emoji === emoji
        );

        if (reactionIndex > -1) {
            post.reactions.splice(reactionIndex, 1);
        } else {
            const userExistingReactionIndex = post.reactions.findIndex(
                (reaction) => reaction.user.toString() === userId.toString()
            );
            if (userExistingReactionIndex > -1) {
                post.reactions[userExistingReactionIndex].emoji = emoji;
            } else {
                post.reactions.push({ user: userId, emoji });
            }
        }

        await post.save();

        await post.populate("user", "username profilePicture");
        await post.populate({
            path: "comments.user",
            select: "username profilePicture",
        });
        await post.populate({
            path: "reactions.user",
            select: "username profilePicture",
        });

        res.status(200).json(post);
    } catch (error) {
        console.error("React to Post Error:", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({
            message: "Server error while reacting to post",
        });
    }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text || !text.trim()) {
        return res
            .status(400)
            .json({ message: "Comment text cannot be empty" });
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = {
            text,
            user: userId,
        };

        post.comments.unshift(newComment);

        await post.save();

        await post.populate("user", "username profilePicture");
        await post.populate({
            path: "comments.user",
            select: "username profilePicture",
        });

        res.status(201).json(post);
    } catch (error) {
        console.error("Add Comment Error:", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid post ID format" });
        }
        res.status(500).json({ message: "Server error while adding comment" });
    }
};

// @desc    Delete a comment from a post
// @route   DELETE /api/posts/:id/comments/:comment_id
// @access  Private (only comment author or post author can delete)
exports.deleteComment = async (req, res) => {
    const postId = req.params.id;
    const commentId = req.params.comment_id;
    const userId = req.user._id;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.find(
            (comment) => comment._id.toString() === commentId
        );

        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (
            comment.user.toString() !== userId.toString() &&
            post.user.toString() !== userId.toString()
        ) {
            return res.status(401).json({
                message: "User not authorized to delete this comment",
            });
        }

        const removeIndex = post.comments.findIndex(
            (comment) => comment._id.toString() === commentId
        );

        if (removeIndex === -1) {
            return res
                .status(404)
                .json({ message: "Comment not found for removal" });
        }

        post.comments.splice(removeIndex, 1);

        await post.save();

        await post.populate("user", "username profilePicture");
        await post.populate({
            path: "comments.user",
            select: "username profilePicture",
        });

        res.status(200).json(post);
    } catch (error) {
        console.error("Delete Comment Error:", error.message);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        res.status(500).json({
            message: "Server error while deleting comment",
        });
    }
};

// @desc    Get a user's posts

// @desc    Get user feed
// @route   GET /api/posts/feed
// @access  Public
exports.getUserFeed = async (req, res) => {
    try {
        const user_id = req.user._id;
        const user = await User.findById(user_id).select("following");
        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        const following = Array.isArray(user.following) ? user.following : [];
        const userAndFollowingIds = [user_id, ...following];
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ user: { $in: userAndFollowingIds } })
            .populate("user", "username profilePicture")
            .populate("comments.user", "username profilePicture")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return res.status(200).json({
            success: true,
            data: posts,
        });
    } catch (error) {
        console.error("Get User Feed Error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching feed",
        });
    }
};
