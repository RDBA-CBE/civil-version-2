import instance from '@/utils/axios.util';

const city = {
    cityList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `city/?page=${page}`;
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
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },
};

export default city;
