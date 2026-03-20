import api from "./axios.js";

export const fetchDashboardStats = async () => {
  const res = await api.get("/dashboard/stats");
  return res.data;
};
