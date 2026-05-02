import axios from "axios";


const baseURL = `${import.meta.env.VITE_API_URL}/api/v1`;

const api = axios.create({
  baseURL,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // Basically ensure save it as 'token' on login
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;


export const getProfessors = () => 
  api.get("/users/getusers");

export const createProfessor = (data) => 
  api.post("/users/register", data);


export const deleteProfessor = (id) => 
  api.delete(`/users/deleteUser/${id}`); 

export const updateProfessor = (id, data) => 
  api.patch(`/users/updateUser/${id}`, data);
