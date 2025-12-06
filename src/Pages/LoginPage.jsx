import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { login } from "../Lib/api";
import toast from "react-hot-toast";

const LoginPage = () => {

    const [loginData, setLoginData] = useState({
        userName: "",
        password: ""
    });

    const queryClient = useQueryClient();
    const { isPending, mutate: loginMutation } = useMutation({
        mutationFn: login,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        }
    });

    const hanleSubmit = (e) => {
        e.preventDefault();

        loginMutation(loginData, {
            onSuccess: () => toast.success('Login Successfully'),
            onError: () => toast.error(error.response?.data?.message || error.message)
        });
    }

    return (
        <div className="h-full flex items-center justify-center bg-linear-to-br from-indigo-200 via-purple-200 to-pink-200 p-4">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <div className="shadow-xl rounded-2xl backdrop-blur-lg bg-white/20 border border-white/30">
                    <form className="p-8" onSubmit={hanleSubmit}>
                        <h2 className="text-3xl font-bold text-white/80 text-center mb-6 drop-shadow-lg">
                            Welcome
                        </h2>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={loginData.userName}
                                onChange={(e) => setLoginData({ ...loginData, userName: e.target.value })}
                                placeholder="UserName"
                                className="w-full rounded-xl bg-white/80 text-black backdrop-blur-lg px-4 py-2.5"
                            />

                            <input
                                type="password"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                placeholder="Password"
                                className="w-full rounded-xl bg-white/80 text-black backdrop-blur-lg px-4 py-2.5"
                            />

                            <button type="Submit" className="w-full text-white rounded-xl py-2 text-lg font-semibold shadow-md bg-indigo-600 hover:bg-indigo-700 cursor-pointer" disabled={isPending} aria-busy={isPending} aria-label="Login">
                                {isPending ? "Signing in..." : "Sign in"}
                            </button>

                            <p className="text-center text-sm text-gray-700 mt-4">
                                Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
                            </p>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default LoginPage;