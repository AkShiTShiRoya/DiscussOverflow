import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { protectedApi } from "../../services/api";
import logout from "../../utils/logout";
import Navbar from "../../components/Navbar/Navbar";

function Dashboard() {
  // send api request to log last visit
  useEffect(() => {
    protectedApi
      .get("/ping")
      .then((response) => {
        if (response?.status === 200) {
          console.log("ping success");
        }
      })
      .catch((error) => {
        console.error(`ping request failed: ${error}`);
        logout();
      });
  }, []);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default Dashboard;
