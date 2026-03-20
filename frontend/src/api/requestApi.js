import api from "./axios";

export const fetchMyRequests     = ()              => api.get("/requests/my-requests").then(r => r.data);
export const fetchOwnerRequests  = ()              => api.get("/requests/incoming").then(r => r.data);
export const fetchBorrowedItems  = ()              => api.get("/requests/borrowed").then(r => r.data);
export const createBorrowRequest = (itemId, message) => api.post("/requests", { itemId, message }).then(r => r.data);
export const approveRequest      = (id)            => api.patch(`/requests/${id}/approve`).then(r => r.data);
export const rejectRequest       = (id)            => api.patch(`/requests/${id}/reject`).then(r => r.data);
export const returnItem          = (id)            => api.patch(`/requests/${id}/return`).then(r => r.data);