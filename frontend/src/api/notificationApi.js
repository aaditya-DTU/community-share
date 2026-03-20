import api from "./axios";

export const fetchNotifications = async () => {
  const { data } = await api.get("/notifications");
  return data;
};

export const markNotificationsAsRead = async () => {
  await api.patch("/notifications/mark-read");
};
