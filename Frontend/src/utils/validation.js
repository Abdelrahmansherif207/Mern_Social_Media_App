// src/utils/validationSchemas.js
import Joi from "joi";

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.email": "Please enter a valid email address",
            "string.empty": "Email is required",
        }),
    password: Joi.string().min(8).required().messages({
        "string.min": "Password must be at least 8 characters",
        "string.empty": "Password is required",
    }),
});

export const registerSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required().messages({
        "string.base": "Username should be a type of text",
        "string.empty": "Username cannot be empty",
        "string.min": "Username should have a minimum length of {#limit}",
        "string.max": "Username should have a maximum length of {#limit}",
        "string.alphanum":
            "Username must only contain alpha-numeric characters",
        "any.required": "Username is required",
    }),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required()
        .messages({
            "string.base": "Email should be a type of text",
            "string.empty": "Email cannot be empty",
            "string.email": "Email format is invalid",
            "any.required": "Email is required",
        }),
    password: Joi.string().min(6).required().messages({
        "string.base": "Password should be a type of text",
        "string.empty": "Password cannot be empty",
        "string.min": "Password should have a minimum length of {#limit}",
        "any.required": "Password is required",
    }),
    confirmPassword: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "Passwords must match",
            "any.required": "Please confirm your password",
            "string.empty": "Please confirm your password",
        }),
    profilePicture: Joi.object({
        lastModified: Joi.number(),
        name: Joi.string(),
        // size: Joi.number().max(5 * 1024 * 1024), // 5MB max
        type: Joi.string().pattern(/^image\/(jpeg|png|gif|webp)$/),
    }).optional(),
});
