import api from "./axios";

export const createReview   = (data)   => api.post("/reviews", data).then(r => r.data);
export const getUserReviews = (userId) => api.get(`/reviews/user/${userId}`).then(r => r.data);