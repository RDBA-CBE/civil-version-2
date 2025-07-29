import instance from '@/utils/axios.util';

const logs = {
    logList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `user-logs/?page=${page}`;
            if (body?.login_ip) {
                url += `&login_ip=${encodeURIComponent(body.login_ip)}`;
            }
            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }
            if (body?.login_at) {
                url += `&login_at_after=${encodeURIComponent(body.login_at)}`;
                url += `&login_at_before=${encodeURIComponent(body.login_at)}`;
            }
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    softwareLogList: (urls:string,page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `${urls}-history/?page=${page}`;
           
            if (body?.from_date) {
                url += `&from_date=${encodeURIComponent(body.from_date)}`;
            }
            if (body?.to_date) {
                url += `&to_date=${encodeURIComponent(body.to_date)}`;
            }
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },


    cityList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `city-history/`;
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
                    console.log('errorsss: ', error);
                    if (error.response) {
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },
};

export default logs;
