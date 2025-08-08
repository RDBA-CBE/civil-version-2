import axios from 'axios';


export const instance = () => {
  const data = axios.create({
    baseURL: 'http://31.97.206.165/api/',

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
