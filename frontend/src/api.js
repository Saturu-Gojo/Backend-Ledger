import axios from "axios";

const API_BASE = "/api/v1";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor to add Access Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor to handle Refresh Token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/login") &&
      !originalRequest.url.includes("/auth/register") &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const res = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken,
        });
        if (res.data.success && res.data.data.accessToken) {
          const { accessToken, refreshToken: newRefreshToken } = res.data.data;
          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken)
            localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshErr) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  login: async (credentials) => {
    const res = await api.post("/auth/login", credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post("/auth/register", userData);
    return res.data;
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },
  getMe: async () => {
    const res = await api.get("/auth/me");
    return res.data;
  },
};

export const accountsAPI = {
  getMyAccounts: async () => {
    const res = await api.get("/accounts/me");
    return res.data;
  },
  getAllAccounts: async () => {
    const res = await api.get("/accounts/all");
    return res.data;
  },
  createAccount: async (data = { currency: "INR" }) => {
    const res = await api.post("/accounts", data);
    return res.data;
  },
  getAccountById: async (id) => {
    const res = await api.get(`/accounts/${id}`);
    return res.data;
  },
  freezeAccount: async (id) => {
    const res = await api.patch(`/accounts/${id}/freeze`);
    return res.data;
  },
  unfreezeAccount: async (id) => {
    const res = await api.patch(`/accounts/${id}/unfreeze`);
    return res.data;
  },
};

export const transactionsAPI = {
  transfer: async (payload, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
    const res = await api.post("/transactions/transfer", payload, { headers });
    return res.data;
  },
  deposit: async (payload, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
    const res = await api.post("/transactions/deposit", payload, { headers });
    return res.data;
  },
  withdraw: async (payload, idempotencyKey) => {
    const headers = {};
    if (idempotencyKey) headers["idempotency-key"] = idempotencyKey;
    const res = await api.post("/transactions/withdraw", payload, { headers });
    return res.data;
  },
  getHistory: async (accountId, params = {}) => {
    const res = await api.get(`/transactions/account/${accountId}`, { params });
    return res.data;
  },
  getLedger: async (accountId = null, params = {}) => {
    const url = accountId
      ? `/transactions/ledger/${accountId}`
      : "/transactions/ledger";
    const res = await api.get(url, { params });
    return res.data;
  },
  getByReference: async (ref) => {
    const res = await api.get(`/transactions/${ref}`);
    return res.data;
  },
};

export default api;
