import React, { createContext, useContext, useState, useMemo } from "react";

const profileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(JSON.parse(localStorage.getItem("userData")) ||null);
  const profileContextValue = useMemo(
    () => ({ profile, setProfile }),
    [profile],
  );

  return (
    <profileContext.Provider value={profileContextValue}>
      {children}
    </profileContext.Provider>
  );
}

export const useProfile = () => {
  return useContext(profileContext);
};
