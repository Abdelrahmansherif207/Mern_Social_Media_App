import React, {
    forwardRef,
    useImperativeHandle,
    useState,
    useRef,
} from "react";
import AuthForm from "./authForm";
import { useAuth } from "../hooks/useAuth";

// import useAuth from "../hooks/useAuth";

import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    useDisclosure,
} from "@heroui/react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";

const AuthModal = forwardRef((props, ref) => {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [isLogin, setIsLogin] = useState(true);
    const formRef = useRef();
    const { login, register, error, loading, clearError } = useAuth();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    useImperativeHandle(ref, () => ({
        openSignIn: () => {
            setIsLogin(true);
            clearError?.();
            formRef.current?.resetForm();
            onOpen();
        },
        openSignUp: () => {
            setIsLogin(false);
            clearError?.();
            formRef.current?.resetForm();
            onOpen();
        },
        getFormData: () => formRef.current?.getFormData(),
        validateForm: () => formRef.current?.validate(),
    }));

    const handleSubmit = async () => {
        if (loading) return;
        clearError?.();

        const isValid = formRef.current?.validate?.();
        if (isValid) {
            const data = formRef.current?.getFormData();

            let success = false;
            try {
                if (isLogin) {
                    console.log(data);
                    success = await login(data);
                } else {
                    console.log(data);
                    try {
                        success = await register(data);
                    } catch (err) {
                        console.log(err);
                    }
                }
                console.log(success);

                if (success) {
                    console.log("Auth successful, navigating home...");
                    navigate("/");
                    onOpenChange(false);
                }
            } catch (err) {
                console.error("Error during submission process:", err);
            }
        } else {
            console.log("Form validation failed!");
        }
    };

    const handleOpenChange = (isOpenStatus) => {
        if (!isOpenStatus) {
            clearError?.();
            formRef.current?.resetForm();
        }
        onOpenChange(isOpenStatus);
    };

    if (isAuthenticated) {
        return <Navigate to="/" />;
    }
    return (
        <Modal
            backdrop="opaque"
            className="p-4"
            classNames={{
                backdrop: `
          bg-gradient-to-br 
          from-zinc-900/80 
          via-zinc-900/40 
          to-zinc-900/20
          backdrop-blur-sm
        `,
                base: `
          border-[1px]
          border-zinc-800
          bg-zinc-900
          text-white
        `,
            }}
            isOpen={isOpen}
            onOpenChange={handleOpenChange}
            key={isLogin ? "modal-login" : "modal-register"}
        >
            <ModalContent className="bg-zinc-950 text-white shadow-xl shadow-black/50">
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 text-white">
                            {isLogin ? "Log in" : "Create Account"}
                        </ModalHeader>
                        <ModalBody className="text-gray-300 px-6 pt-1 pb-3">
                            <AuthForm
                                isLogin={isLogin}
                                ref={formRef}
                                key={isLogin ? "form-login" : "form-register"}
                            />

                            <div className="mt-1 min-h-4">
                                {error && (
                                    <div className="p-2 rounded-md bg-red-900/40 border border-red-700/50 text-red-300 text-xs flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex justify-center flex-col gap-3 items-center pt-3 pb-4 border-t border-zinc-800/50">
                            <Button
                                color="default"
                                variant="flat"
                                radius="full"
                                className="w-72 h-11 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:bg-zinc-800 transition-colors"
                                type="submit"
                                isDisabled={loading}
                                onPress={handleSubmit}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                                ) : (
                                    <span className="text-white text-medium font-semibold">
                                        {isLogin ? "Sign in" : "Sign up"}
                                    </span>
                                )}
                            </Button>

                            <div className="flex items-center w-72 h-1">
                                <div className="h-px flex-grow bg-gradient-to-r from-transparent to-gray-500" />
                                <span className="mx-2 font-medium text-gray-500 text-xs">
                                    OR
                                </span>
                                <div className="h-px flex-grow bg-gradient-to-r from-gray-500 to-transparent" />
                            </div>

                            <Button
                                className="bg-gradient-to-tr from-gray-50 to-gray-100 text-gray-700 shadow-lg w-72 h-11 hover:shadow-xl transition-shadow"
                                radius="full"
                                isDisabled={loading}
                            >
                                <div className="flex items-center justify-center gap-3">
                                    <img
                                        src="https://www.google.com/favicon.ico"
                                        alt="Google"
                                        className="w-5 h-5"
                                    />
                                    <span className="text-medium font-semibold">
                                        Continue with Google
                                    </span>
                                </div>
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
});

export default AuthModal;
