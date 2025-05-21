import axios from 'axios';

const api = axios.create({
  baseURL: 'https://n11845619.ifn666.com/eventhive/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
