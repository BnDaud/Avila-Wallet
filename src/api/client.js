import axios from "axios";
import * as SecureStore from "expo-secure-store";

// We use your live Render URL so your phone can easily connect to it!
const BASE_URL = "https://wallet-ppuc.onrender.com/api/";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// This "Interceptor" runs before EVERY request.
// It grabs the token from the phone's secure vault and attaches it.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Error fetching token from SecureStore", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default apiClient;
