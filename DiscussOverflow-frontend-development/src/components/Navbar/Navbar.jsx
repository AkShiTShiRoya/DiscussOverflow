import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logout from "../../utils/logout";
import { useProfile } from "../../hooks/useProfile";
import Admin from "../../pages/Admin/Admin";
import { protectedApi } from "../../services/api";

const Navbar = () => {
  const { profile } = useProfile();
  const [user, setUser] = useState(null); // changed from users[] to single user object

  const fetchUser = () => {
    protectedApi
      .get(`/api/user/v1/users/${profile._id}`)
      .then((response) => {
        if (response.status === 200) {
          setUser(response.data.user); // fixed key
          console.log("User data", response.data.user);
        }
      })
      .catch((err) => {
        console.error("fetch user failed", err);
      });
  };
  console.log("This is show that is admin"+user?.is_admin);
  useEffect(() => {
    if (profile?._id) {
      fetchUser();
    }
  }, [profile]);

  return (
    <div className="bg-azure px-[13%] shadow-md z-50 sticky top-0">
      <div className="flex justify-between items-center">
        <Link to="/" className="p-6 flex space-x-2 text-4xl items-center">
          <span className="text-outer-space font-medium">SVGU</span>
          <span className="text-outer-space-light font-light text-2xl">|</span>
          <span className="text-outer-space-light font-light text-2xl font-serif">
            Discuss Overflow
          </span>
        </Link>

        <div className="flex justify-center items-center">
          {user?.is_admin === true ? (
              <Link to="/admin">
                <button className="m-4 me-2 hover:text-keppel" onClick={Admin}>
                  Admin 
                </button>     
                <span className="font-extrabold text-keppel">|</span>   
              </Link>  
            ) : (
              <></>
            )}
          
          <button className="m-4 me-2 hover:text-keppel" onClick={logout}>
            Logout
          </button>
          <span className="font-extrabold text-keppel">|</span>&nbsp;&nbsp;
          <p>{profile?.username}</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
