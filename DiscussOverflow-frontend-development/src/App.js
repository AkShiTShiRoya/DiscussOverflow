import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ProtectedRoutes from "./middleware/auth";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProfileProvider } from "./hooks/useProfile";
import Main from "./pages/Main/Main";
import Home from "./components/Home/Home";
import Login from "./pages/Login/Login";
import Thread from "./components/Thread/Thread";
import { ToastContainer } from "react-toastify";
import vanata from "./components/vanata/vanata";
import Admin from "./pages/Admin/Admin";
import UserDetailsWithThreads from "./pages/Admin/UserDetailsWithThreads";

function App() {
  const { isLoggedIn } = useAuth(); // useParams state which indicated if a user is logged in or not

  return (
    <>
      <ToastContainer />
      <div className="bg-[#fffefe] max-w-screen">
        <Routes>
          <Route
            element={
              isLoggedIn ? <ProtectedRoutes /> : <Navigate to="/login" />
            } // protected routes
          >
            <Route path="/" element={<Main />}>
              <Route index element={<Home />} />
              <Route path="thread/:id" element={<Thread />} />
              <Route path="admin" element={<Admin />} />
              <Route path="/userprofile/:userId" element={<UserDetailsWithThreads />} />
              {/* <Route path="vanata" element={<Vanata />} /> */}
            </Route>
          </Route>
          <Route
            path="/login"
            element={!isLoggedIn ? <Login /> : <Navigate to="/" />} // if user is logged in redirect to /
          />
          <Route path="/signup" element={<Navigate to="/login" />} />
          <Route
            path="*"
            element={
              <div className="flex justify-center items-center">
                <div>404 - page not found</div>
              </div>
            }
          />
        </Routes>
      </div>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <AuthProvider>
    <ProfileProvider>
      <Router>
        <App />
      </Router>
    </ProfileProvider>
  </AuthProvider>
);
