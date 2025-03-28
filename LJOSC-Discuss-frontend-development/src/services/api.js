import axios from "axios";
import jwtDecode from "jwt-decode";
import dayjs from "dayjs";
import logout from "../utils/logout";

const baseURL = process.env.BACKEND_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL,
  timeout: 5000,
});

export default api;

let accessToken = localStorage.getItem("accessToken");
let refreshToken = localStorage.getItem("refreshToken");

const protectedApi = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${accessToken}`,
  },
});

// eslint-disable-next-line consistent-return
protectedApi.interceptors.request.use(async (req) => {
  try {
    accessToken = localStorage.getItem("accessToken");
    req.headers.Authorization = `Bearer ${accessToken}`;
    if (!accessToken) {
      logout();
    }
    const user = jwtDecode(accessToken);
    // console.log(new Date(user.exp * 1000));
    const isAccessTokenExpired = dayjs.unix(user?.exp).diff(dayjs()) < 1;
    console.log("Access token expired: ", isAccessTokenExpired);
    try {
      // eslint-disable-next-line
      if (!isAccessTokenExpired) return req;

      refreshToken = localStorage.getItem("refreshToken");
      const decodedRefreshToken = jwtDecode(refreshToken);
      const isRefreshTokenExpired =
        dayjs.unix(decodedRefreshToken?.exp).diff(dayjs()) < 1;
      console.log("Refresh token expired: ", isRefreshTokenExpired);

      if (isRefreshTokenExpired) {
        logout();
      }

      const response = await api.post(`/auth/v1/refresh-token/`, {
        refreshToken: refreshToken?.toString(),
      });

      if (response?.status === 200) {
        accessToken = response?.data?.accessToken;
        localStorage.setItem("accessToken", accessToken);
        req.headers.Authorization = `Bearer ${accessToken}`; // eslint-disable-next-line
        return req;
      }
    } catch (err) {
      logout();
    }
  } catch (err) {
    console.log("protectedApi: ", err);
  }
});

export { protectedApi };
