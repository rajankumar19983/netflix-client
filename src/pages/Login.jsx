import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/user-slice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";

const Login = () => {
  const email = sessionStorage.getItem("email") || "";
  const [passwordType, setPasswordType] = useState(true);
  const [formData, setFormData] = useState({
    loginId: email,
    password: "",
  });
  let clientErrors = {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const runClientSideValidations = () => {
    if (formData.loginId.trim().length === 0) {
      clientErrors.loginId = "email / username is required";
    }
    if (formData.password.trim().length === 0) {
      clientErrors.password = "password is required";
    }
  };

  const handleLogin = async (e) => {
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
      const result = await dispatch(login({ formData }));
      if (login.fulfilled.match(result)) {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="h-screen w-full hero-bg mx-auto py-24">
      <div className="flex justify-center items-center mx-3">
        <div className="w-full max-w-md p-8 space-y-6 bg-black/60 rounded-b-lg">
          <h1 className="text-center text-white text-2xl font-bold mb-4">
            Login
          </h1>
          <form
            className="space-y-4"
            onSubmit={handleLogin}
          >
            <div>
              <label
                htmlFor="loginId"
                className="text-sm font-medium text-gray-300 block"
              >
                Email / Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 mt-1 border border-gray-700 rounded-md bg-transparent text-white focus:outline-none focus:ring"
                placeholder="you@example.com / jamesbond"
                id="loginId"
                value={formData.loginId}
                onChange={(e) =>
                  setFormData({ ...formData, loginId: e.target.value })
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
              Log In
            </button>
            <div className="text-center text-gray-400">
              New to Netflix?{" "}
              <Link
                to="/signup"
                className="text-red-500 hover:underline"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
