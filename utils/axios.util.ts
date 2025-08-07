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

    data.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            const accessToken = localStorage.getItem('token');

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    // Call logout API
                    await axios.post(
                        'http://31.97.206.165/api/logout/',
                        {},
                        {
                            headers: {
                                authorization: `Token ${localStorage.getItem('token')}`,
                            },
                        }
                    );
                } catch (logoutError) {
                    console.error('Logout failed:', logoutError);
                }

                localStorage.clear();

                window.location.href = '/';

                return Promise.reject(error);
            } 
            // else {
            //     localStorage.clear();

            //     window.location.href = '/';
            // }

            return Promise.reject(error);
        }
    );

    return data;
};

export default instance;
