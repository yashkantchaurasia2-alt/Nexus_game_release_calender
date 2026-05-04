import axios from 'axios';

const api = axios.create({
  baseURL: 'https://free-to-play-games-database.p.rapidapi.com/api',
});

api.interceptors.request.use((config) => {
  // Add RapidAPI required headers
  config.headers['x-rapidapi-key'] = import.meta.env.VITE_FREETOGAME_API_KEY;
  config.headers['x-rapidapi-host'] = 'free-to-play-games-database.p.rapidapi.com';
  return config;
});

export default api;
