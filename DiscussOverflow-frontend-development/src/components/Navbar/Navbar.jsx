import React from "react";
import { Link } from "react-router-dom";
import logout from "../../utils/logout";
import { useProfile } from "../../hooks/useProfile";

const Navbar = () => {
  const { profile } = useProfile();
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
        <button className="m-4 me-2" onClick={logout}>
          Logout
        </button>
        <p>|</p>&nbsp;&nbsp;
        <p>{profile?.username}</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
