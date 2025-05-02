import React from "react";
import { auth, provider } from "../firebase/firebaseConfig";
import { signInWithPopup } from "firebase/auth";

export default function Login({ handleAuthState }) {
    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then((res) => {
            console.log(res);
            localStorage.setItem("isAuth", true);
            handleAuthState();
        });
    };
    return (
        <>
            <p>Sign in with google</p>
            <button className="btn btn" onClick={signInWithGoogle}>
                Log in
            </button>
        </>
    );
}
