const mongoose = require("mongoose");

const ReactionSchema = new mongoose.Schema(
    {
        emoji: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { _id: false }
);

const CommentSchema = new mongoose.Schema({
    text: { type: String, required: true, trim: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
});

const PostSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: [true, "Post content cannot be empty"],
            trim: true,
            maxlength: [2000, "Post content cannot exceed 2000 characters"],
        },
        image: {
            type: String,
            default: "",
        },
        reactions: [ReactionSchema],
        comments: [CommentSchema],
    },
    { timestamps: true }
);

PostSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
