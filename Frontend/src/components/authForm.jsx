import React, { useState, forwardRef, useImperativeHandle } from "react";
import { Input } from "@heroui/react";
import { loginSchema, registerSchema } from "../utils/validation";
import {
    User,
    Mail,
    Lock,
    Camera,
    AlertTriangle,
    CheckCircle,
    Loader2,
    UploadCloud,
} from "lucide-react";
import Joi from "joi";

const IMGBB_API_KEY = "b60c97880ba68426244c0130c1d72def";
const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

const AuthForm = forwardRef(({ isLogin }, ref) => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        confirmPassword: "",
        profilePicture: null,
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const uploadToImgBB = async (file) => {
        setFormData((prev) => ({
            ...prev,
            profilePicture: {
                ...prev.profilePicture,
                uploading: true,
                error: null,
            },
        }));

        const uploadData = new FormData();
        uploadData.append("key", IMGBB_API_KEY);
        uploadData.append("image", file);

        try {
            const response = await fetch(IMGBB_UPLOAD_URL, {
                method: "POST",
                body: uploadData,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result?.error?.message || "ImgBB upload failed"
                );
            }

            console.log("ImgBB Upload Result:", result);
            setFormData((prev) => ({
                ...prev,
                profilePicture: {
                    ...prev.profilePicture,
                    url: result.data.url,
                    uploading: false,
                    file: null,
                },
            }));
            setErrors((prev) => ({ ...prev, profilePicture: null }));
        } catch (error) {
            console.error("ImgBB Upload Error:", error);
            setFormData((prev) => ({
                ...prev,
                profilePicture: {
                    ...prev.profilePicture,
                    uploading: false,
                    error: `Upload failed: ${error.message}`,
                },
            }));
            setErrors((prev) => ({
                ...prev,
                profilePicture: `Upload failed: ${error.message}`,
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                setErrors((prev) => ({
                    ...prev,
                    profilePicture: "Please select an image file.",
                }));
                setFormData((prev) => ({ ...prev, profilePicture: null }));
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrors((prev) => ({
                    ...prev,
                    profilePicture: "Image size should not exceed 5MB.",
                }));
                setFormData((prev) => ({ ...prev, profilePicture: null }));
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData((prev) => ({
                    ...prev,
                    profilePicture: {
                        file,
                        preview: reader.result,
                        url: null,
                        uploading: false,
                        error: null,
                    },
                }));
                setErrors((prev) => ({ ...prev, profilePicture: null }));
                uploadToImgBB(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        if (field === "confirmPassword") {
            validateConfirmPassword(formData.confirmPassword);
        } else {
            validateField(field, formData[field]);
        }
    };

    const validateField = async (field, value) => {
        const schema = isLogin ? loginSchema : registerSchema;

        try {
            // Validate field in isolation
            await Joi.object({ [field]: schema.extract(field) }).validateAsync({
                [field]: value,
            });

            setErrors((prev) => ({ ...prev, [field]: null }));
        } catch (error) {
            // Only keep the FIRST error per field
            const firstError = error.details.find((d) => d.path[0] === field);
            setErrors((prev) => ({
                ...prev,
                [field]: firstError?.message || null,
            }));
        }
    };
    const validateConfirmPassword = (confirmPassword) => {
        if (!isLogin) {
            if (!confirmPassword) {
                setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Please confirm your password",
                }));
            } else if (confirmPassword !== formData.password) {
                setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Passwords must match",
                }));
            } else {
                setErrors((prev) => ({ ...prev, confirmPassword: null }));
            }
        }
    };

    useImperativeHandle(ref, () => ({
        validate: () => {
            const schema = isLogin ? loginSchema : registerSchema;
            const dataToValidate = isLogin
                ? { email: formData.email, password: formData.password }
                : {
                      email: formData.email,
                      password: formData.password,
                      username: formData.username,
                      confirmPassword: formData.confirmPassword,
                  };

            const { error } = schema.validate(dataToValidate, {
                abortEarly: false,
            });
            const newErrors = { ...errors };
            let valid = true;

            const fieldsToTouch = isLogin
                ? ["email", "password"]
                : [
                      "email",
                      "password",
                      "username",
                      "confirmPassword",
                      "profilePicture",
                  ];
            const newTouched = { ...touched };
            fieldsToTouch.forEach((field) => (newTouched[field] = true));
            setTouched(newTouched);

            if (error) {
                valid = false;
                error.details.forEach((detail) => {
                    if (detail.path && !newErrors[detail.path[0]]) {
                        newErrors[detail.path[0]] = detail.message;
                    }
                });
            }

            if (!isLogin && formData.profilePicture) {
                if (formData.profilePicture.uploading) {
                    newErrors.profilePicture = "Image upload in progress...";
                    valid = false;
                } else if (formData.profilePicture.error) {
                    newErrors.profilePicture = formData.profilePicture.error;
                    valid = false;
                }
            }

            setErrors(newErrors);
            return valid;
        },
        getFormData: () => {
            const profilePictureUrl = formData.profilePicture?.url || "";

            if (!isLogin) {
                return {
                    username: formData.username,
                    email: formData.email,
                    password: formData.password,
                    profilePicture: profilePictureUrl,
                };
            } else {
                return { email: formData.email, password: formData.password };
            }
        },
        resetForm: () => {
            setFormData({
                email: "",
                password: "",
                username: "",
                confirmPassword: "",
                profilePicture: null,
            });
            setErrors({});
            setTouched({});
        },
    }));

    const renderFeedback = (field) => {
        if (!touched[field]) return <div className="h-4 mt-1"></div>;

        if (errors[field]) {
            return (
                <div className="flex items-center gap-1 mt-1 text-rose-500 text-xs h-4 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-pink-500" />
                    <span className="font-medium">{errors[field]}</span>
                </div>
            );
        }

        if (formData[field]) {
            return (
                <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs h-4 animate-bounce">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-400" />
                    <span className="font-medium">Looks good!</span>
                </div>
            );
        }

        return <div className="h-4 mt-1"></div>;
    };

    const getInputWrapperClass = (field) => {
        const isTouched = touched[field];
        const hasError = !!errors[field];
        const isValid = isTouched && formData[field] && !hasError;

        // Base styles
        const baseClasses = `
            border-b-2 
            transition-all 
            duration-300 
            ease-[cubic-bezier(0.4,0,0.2,1)]
            relative
            overflow-hidden
            group
        `;

        // Error state - always visible
        if (hasError) {
            return `
            ${baseClasses}
            !border-b-rose-500
            bg-gradient-to-r from-rose-500/5 to-pink-500/5
            shadow-[0_2px_4px_rgba(244,63,94,0.3)]
            before:content-['🚨']
            before:absolute
            before:right-2
            before:top-1/2
            before:-translate-y-1/2
            before:text-lg
            before:animate-gentleSpin
            before:opacity-100
        `;
        }

        // Valid state - always visible
        if (isValid) {
            return `
                ${baseClasses}
                !border-b-emerald-400
                bg-gradient-to-r from-emerald-400/10 to-teal-400/10
                shadow-[0_2px_8px_rgba(16,185,129,0.15)]
                before:content-['✅']
                before:absolute
                before:right-2
                before:top-1/2
                before:-translate-y-1/2
                before:text-lg
                before:animate-gentleSpin
                before:opacity-100
            `;
        }

        // Default state
        return `
            ${baseClasses}
            border-b-gray-300/80
            hover:border-b-blue-300
            focus-within:border-b-blue-400
        `;
    };

    const getProfilePicBorderClass = () => {
        if (errors.profilePicture) {
            return "border-red-500";
        } else if (formData.profilePicture?.url) {
            return "border-green-500";
        } else if (formData.profilePicture?.uploading) {
            return "border-blue-500";
        }
        return "border-cream-700 group-hover:border-cream-500";
    };

    return (
        <div className="space-y-1">
            {!isLogin && (
                <div className="flex flex-col items-center">
                    <label
                        htmlFor="profile-picture"
                        className="relative group w-24 h-24 mb-1 cursor-pointer"
                    >
                        <div
                            className={`w-full h-full rounded-full overflow-hidden border-2 ${getProfilePicBorderClass()} bg-cream-900 flex items-center justify-center transition-colors duration-300`}
                        >
                            {formData.profilePicture?.preview ? (
                                <img
                                    src={formData.profilePicture.preview}
                                    alt="Profile preview"
                                    className={`w-full h-full object-cover ${
                                        formData.profilePicture?.uploading ||
                                        formData.profilePicture?.error
                                            ? "opacity-50"
                                            : ""
                                    }`}
                                />
                            ) : (
                                <UploadCloud className="w-8 h-8 text-cream-600" />
                            )}
                        </div>
                        {formData.profilePicture?.uploading && (
                            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                                <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                        )}
                        {!formData.profilePicture?.uploading &&
                            !formData.profilePicture?.url && (
                                <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity duration-200">
                                    {!formData.profilePicture?.preview && (
                                        <Camera className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                </div>
                            )}
                    </label>
                    <input
                        id="profile-picture"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        disabled={formData.profilePicture?.uploading}
                    />
                    {renderFeedback("profilePicture")}
                </div>
            )}

            {!isLogin && (
                <div>
                    <Input
                        startContent={
                            <User className="w-4 h-4 text-cream-500 pointer-events-none flex-shrink-0" />
                        }
                        label="Username"
                        placeholder="Choose a username"
                        value={formData.username}
                        onValueChange={(val) => handleChange("username", val)}
                        onBlur={() => handleBlur("username")}
                        variant="underlined"
                        classNames={{
                            inputWrapper: getInputWrapperClass("username"),
                            input: "!text-white placeholder-cream-500",
                            label: "text-cream-200",
                        }}
                        isDisabled={formData.profilePicture?.uploading}
                    />
                    {renderFeedback("username")}
                </div>
            )}

            <div>
                <Input
                    startContent={
                        <Mail className="w-4 h-4 text-cream-500 pointer-events-none flex-shrink-0" />
                    }
                    label="Email"
                    placeholder="your@email.com"
                    type="email"
                    value={formData.email}
                    onValueChange={(val) => handleChange("email", val)}
                    onBlur={() => handleBlur("email")}
                    variant="underlined"
                    classNames={{
                        inputWrapper: getInputWrapperClass("email"),
                        input: "!text-white placeholder-cream-500",
                        label: "text-cream-200",
                    }}
                    isDisabled={formData.profilePicture?.uploading}
                />
                {renderFeedback("email")}
            </div>

            <div>
                <Input
                    startContent={
                        <Lock className="w-4 h-4 text-cream-500 pointer-events-none flex-shrink-0" />
                    }
                    label="Password"
                    placeholder="••••••••"
                    type="password"
                    value={formData.password}
                    onValueChange={(val) => handleChange("password", val)}
                    onBlur={() => handleBlur("password")}
                    variant="underlined"
                    classNames={{
                        inputWrapper: getInputWrapperClass("password"),
                        input: "!text-white",
                        label: "text-cream-200",
                    }}
                    isDisabled={formData.profilePicture?.uploading}
                />
                {renderFeedback("password")}
            </div>

            {!isLogin && (
                <div>
                    <Input
                        startContent={
                            <Lock className="w-4 h-4 text-cream-500 pointer-events-none flex-shrink-0" />
                        }
                        label="Confirm Password"
                        placeholder="••••••••"
                        type="password"
                        value={formData.confirmPassword}
                        onValueChange={(val) =>
                            handleChange("confirmPassword", val)
                        }
                        onBlur={() => handleBlur("confirmPassword")}
                        variant="underlined"
                        classNames={{
                            inputWrapper:
                                getInputWrapperClass("confirmPassword"),
                            input: "!text-white",
                            label: "text-cream-200",
                        }}
                        isDisabled={formData.profilePicture?.uploading}
                    />
                    {renderFeedback("confirmPassword")}
                </div>
            )}
        </div>
    );
});

export default AuthForm;
