import instance from '@/utils/axios.util';

const state = {
    stateList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `state/?page=${page}`;
            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
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

     countryList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `country/?page=${page}`;
            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
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

}

export default state