import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

export const sendMessage = async (sessionId, message) => {
  const res = await api.post("/api/chat", { sessionId, message });
  return res.data;
};

export const getConversation = async (sessionId) => {
  const res = await api.get(`/api/conversations/${sessionId}`);
  return res.data;
};