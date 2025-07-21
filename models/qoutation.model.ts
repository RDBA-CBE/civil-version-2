import instance from '@/utils/axios.util';

const qoutation = {
    qoutationList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `qoutation/?page=${page}`;
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
}

export default qoutation;