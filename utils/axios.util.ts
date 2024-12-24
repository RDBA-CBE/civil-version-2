import axios from 'axios';

export const instance = () => {
  const data = axios.create({
    baseURL: 'https://63fkxqqj-8000.inc1.devtunnels.ms/',
  });

  data.interceptors.request.use(async function (config) {
    const accessToken = localStorage.getItem('token');
    if (accessToken) {
      config.headers['authorization'] = `Token ${accessToken}`;
    }
    return config;
  });

  return data;
};

export default instance;
