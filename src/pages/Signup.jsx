import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signup } from "../store/user-slice.js";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const Signup = () => {
  const email = sessionStorage.getItem("email") || "";
  const [passwordType, setPasswordType] = useState(true);
  const [formData, setFormData] = useState({
    email: email,
    username: "",
    password: "",
  });
  let clientErrors = {};
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const runClientSideValidations = () => {
    if (formData.email.trim().length === 0) {
      clientErrors.email = "email is required";
    }
    if (formData.username.trim().length === 0) {
      clientErrors.username = "username is required";
    }
    if (formData.password.trim().length === 0) {
      clientErrors.password = "password is required";
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clientErrors = {};
    toast.dismiss();
    runClientSideValidations();
    if (Object.keys(clientErrors).length !== 0) {
      Object.values(clientErrors).map((ele) => {
        toast.error(ele);
      });
    } else {
      clientErrors = {};
      const result = await dispatch(signup({ formData }));
      if (signup.fulfilled.match(result)) {
        navigate("/login");
      }
    }
  };

  return (
    <div className="h-screen w-full hero-bg mx-auto py-24">
      <div className="flex justify-center items-center mx-3">
        <div className="w-full max-w-md p-8 space-y-6 bg-black/60 rounded-b-lg">
          <h1 className="text-center text-white text-2xl font-bold mb-4">
            Sign Up
          </h1>
          <form
            className="space-y-4"
            onSubmit={handleSignUp}
          >
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300 block"
              >
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 mt-1 border border-gray-700 rounded-md bg-transparent text-white focus:outline-none focus:ring"
                placeholder="you@example.com"
                id="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-300 block"
              >
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 mt-1 border border-gray-700 rounded-md bg-transparent text-white focus:outline-none focus:ring"
                placeholder="JamesBond"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300 block"
              >
                Password
              </label>
              <div className="w-full mt-1 flex items-center justify-center border border-gray-700 rounded-md bg-transparent focus-within:ring text-white">
                <input
                  type={passwordType ? "password" : "text"}
                  className="w-full flex-1 px-3 py-2 rounded-md outline-none bg-transparent"
                  id="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div
                  className="cursor-pointer p-2"
                  onClick={(e) => setPasswordType(!passwordType)}
                >
                  {passwordType ? (
                    <FaEye className="size-6" />
                  ) : (
                    <FaEyeSlash className="size-6" />
                  )}
                </div>
              </div>
            </div>
            <button className="w-full py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 cursor-pointer">
              Sign Up
            </button>
            <div className="text-center text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-red-500 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
