import React, { useState } from 'react';
import "./login.css";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../lib/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import upload from '../../lib/upload';

const Login = () => {
    const [avatar, setAvatar] = useState({
        file: null,
        url: ""
    });
    const [loading, setLoading] = useState(false);

    const handleAvatar = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setAvatar({
                file,
                url: URL.createObjectURL(file)
            });
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const { username, email, password } = Object.fromEntries(formData);

        if (!username || !email || !password) {
            toast.error("All fields are required");
            setLoading(false);
            return;
        }

        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const imgUrl = await upload(avatar.file);

            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: imgUrl,
                id: res.user.uid,
                blocked: [],
            });

            await setDoc(doc(db, "userchats", res.user.uid), {
                chats: [],
            });

            toast.success("Success!!");
        } catch (err) {
            console.error("Error adding document: ", err);
            toast.error(err.message);
        } finally {
            setLoading(false);
            URL.revokeObjectURL(avatar.url);  // Clean up URL object to avoid memory leak
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const formData = new FormData(e.target);
        const email = formData.get('email');
        const password = formData.get('password');

        if (!email || !password) {
            toast.error("All fields are required");
            setLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Login successful!");
        } catch (err) {
            console.error("Error logging in: ",err);
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login'>
            <ToastContainer />
            <div className="item">
                <h2>Welcome Back</h2>
                <form onSubmit={handleLogin}>
                    <label htmlFor="email">Email</label>
                    <input type="email" placeholder='Email' name='email' required />
                    <label htmlFor="password">Password</label>
                    <input type="password" placeholder='Password' name='password' required />
                    <button disabled={loading}>{loading ? "Loading..." : "Sign In"}</button>
                </form>
            </div>

            <div className="sep"></div>

            <div className="item">
                <h2>Create Account</h2>
                <form onSubmit={handleRegister}>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="Avatar Preview" />
                        Upload Image
                    </label>
                    <input type="file" id='file' name="file" style={{ display: 'none' }} onChange={handleAvatar} required />
                    <label htmlFor="username">Username</label>
                    <input type="text" placeholder='Username' name='username' required />
                    <label htmlFor="email">Email</label>
                    <input type="email" placeholder='Email' name='email' required />
                    <label htmlFor="password">Password</label>
                    <input type="password" placeholder='Password' name='password' required />
                    <button disabled={loading}>{loading ? "Loading..." : "Sign Up"}</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
