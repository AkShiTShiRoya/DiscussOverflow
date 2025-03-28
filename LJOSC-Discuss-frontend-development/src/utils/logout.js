const logout = () => {
  localStorage.clear();
  sessionStorage.clear();

  // redirect to login page after 500ms
  setTimeout(() => {
    window.location = "/login";
  }, 500); // This delay depends on useEffect of useAuth.
};

export default logout;
