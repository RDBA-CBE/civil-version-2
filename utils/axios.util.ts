import axios from 'axios';

export const instance = () => {
  const data = axios.create({
    baseURL: 'http://app.covaicivillab.com/',
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
