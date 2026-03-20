import api from "./axios";

export const fetchNearbyItems = async (lng, lat) => {
  const { data } = await api.get(
    `/items/nearby?lng=${lng}&lat=${lat}&distance=15000`
  );
  return data;
};
