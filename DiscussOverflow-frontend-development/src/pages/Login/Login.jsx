import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useProfile } from "../../hooks/useProfile";
import { notifyWarn } from "../../utils/toastNotification";

const PASSWORD_REGEX = /^[A-Za-z0-9!@#$%^&*-_,.]{8,}$/;
const EMAIL_REGEX =
  /^[A-Za-z0-9!#$%&'*+-/=?^_`{|}~]+@[A-Za-z.]{2,}\.[A-Za-z]{2,}$/;

const Login = () => {
  const { setProfile } = useProfile();
  const [payload, setPayload] = useState({ email: "", password: "" });
  const [mode, setMode] = useState("Login");
  const [message, setMessage] = useState();

  // send login payload to the backend
  const login = () => {
    api
      .post("/auth/v1/login", {
        email: payload.email,
        password: payload.password,
      })
      .then((response) => {
        if (response.status === 200) {
          const { accessToken, refreshToken, user } = response.data;
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("userData", JSON.stringify(user));
          setProfile(user);
          console.log("user :", user);
          setMessage({
            status: "success",
            content: "Login successful",
          });
          window.location = "/";
        }
      })
      .catch((err) => {
        console.error("Login failed! ", err);
        setMessage({
          status: "failure",
          content: "Login failed!",
        });
      });
  };

  // send signup payload to the backend
  const signup = () => {
    api
      .post("/auth/v1/signup", {
        username: payload.email.split("@")[0],
        email: payload.email,
        password: payload.password,
      })
      .then((response) => {
        if (response.status === 201) {
          setMessage({
            status: "success",
            content: "Registration successful",
          });
        }
      })
      .catch((err) => {
        setMessage({
          status: "failure",
          content: "Account already registered!",
        });
        console.error("Login failed! ", err);
      });
  };
  

  // for debugging
  // useEffect(() => {
  //   console.log(payload);
  //   console.log();
  // }, [payload]);

  // switch between signup and login forms
  useEffect(() => {
    if (mode === "Login") {
      setPayload({ email: "", password: "" });
    } else if (mode === "Signup") {
      setPayload({ email: "", password: "", confirmPassword: "" });
    }
    setMessage(undefined);
  }, [mode]);

  const handlePayloadUpdate = (e) => {
    const { name, value } = e.target;
    setPayload({ ...payload, [name]: value });
  };

  const processForm = () => {
    if (!payload.email && !payload.password && (!payload.confirmPassword || mode !== "Signup")) {
      notifyWarn("All fields are required.");
      return;
    }
  
    if (!payload.email) {
      notifyWarn("Email is required.");
      return;
    }
  
    if (!EMAIL_REGEX.test(payload.email)) {
      notifyWarn("Please enter a valid email address.");
      return;
    }
  
    if (!payload.password) {
      notifyWarn("Password is required.");
      return;
    }
  
    if (!PASSWORD_REGEX.test(payload.password)) {
      notifyWarn("Password does not meet the required format.");
      return;
    }
  
    if (mode === "Signup") {
      if (!payload.confirmPassword) {
        notifyWarn("Confirm password is required.");
        return;
      }
  
      if (payload.password !== payload.confirmPassword) {
        notifyWarn("Passwords do not match.");
        return;
      }
  
      signup();
    } else if (mode === "Login") {
      login();
    }
  };
  

  return (
    <div className="flex items-center justify-between h-screen">
      <div className="bg-keppel text-white w-3/5 flex flex-col justify-start space-y-20 h-screen">
        <div className="py-12 px-20">
          <button className="flex space-x-2 text-4xl items-center">
            <span className="text-white font-medium">SVGU</span>
            <span className="text-white font-light text-2xl">|</span>
            <span className="text-white font-light text-2xl font-serif">
              Discuss Overflow
            </span>
          </button>
        </div>
        <div className="px-20 h-full text-4xl font-serif leading-normal flex flex-col w-full">
          <span className="text-justify">
            &#10077; Open source is the way to go, to do something meaningful in
            the world of computers, without having to beg for permission from
            some large corporation that probably does not have your best
            interests at heart.&#10078;
          </span>
          <div className="text-end">- Linus Torvalds</div>
        </div>
      </div>
      <div className="flex flex-col w-2/5 h-screen justify-center">
        <div className="flex justify-center items-start">
          <button
            className={`p-2 px-4 rounded-l hover:bg-keppel-dark ${
              mode === "Login" ? "bg-keppel text-white" : ""
            } hover:text-white border-l-2 border-t-2 border-b-2 border-keppel`}
            onClick={() => setMode("Login")}
          >
            Login
          </button>
          <button
            className={`p-2 px-4 rounded-r hover:bg-keppel-dark ${
              mode === "Signup" ? "bg-keppel text-white" : ""
            } hover:text-white border-r-2 border-t-2 border-b-2 border-keppel`}
            onClick={() => setMode("Signup")}
          >
            Signup
          </button>
        </div>
        <div className="p-16">
          {message ? (
            <div
              className={`border ${
                message.status === "success"
                  ? "border-green-400 bg-green-100 text-green-700"
                  : "border-red-400 bg-red-100 text-red-700"
              } px-4 py-3 rounded relative mb-6`}
              role="alert"
            >
              {/* <strong className="font-bold">Failure!</strong> */}
              <span className="block sm:inline">{message.content}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg
                  className={`fill-current h-6 w-6 ${
                    message.status === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  onClick={() => setMessage(undefined)}
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </span>
            </div>
          ) : (
            ""
          )}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={payload?.email || ""}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:keppel focus:border-keppel block w-full p-2.5 focus:ring-keppel focus:ring-1 focus-visible:outline-none"
              placeholder="name@example.com"
              onChange={handlePayloadUpdate}
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900"
            >
              Your password
            </label>
            <input
              type="password"
              id="password"
              value={payload?.password || ""}
              name="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:keppel focus:border-keppel block w-full p-2.5 focus:ring-keppel focus:ring-1 focus-visible:outline-none"
              onChange={handlePayloadUpdate}
              required
            />
          </div>
          {mode === "Signup" ? (
            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={payload?.confirmPassword || ""}
                name="confirmPassword"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:keppel focus:border-keppel block w-full p-2.5 focus:ring-keppel focus:ring-1 focus-visible:outline-none"
                onChange={handlePayloadUpdate}
                required
              />
            </div>
          ) : (
            ""
          )}
          <button
            onClick={processForm}
            className="text-white bg-keppel disabled:bg-gray-400 hover:bg-keppel-dark focus:outline-none focus:keppel font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
