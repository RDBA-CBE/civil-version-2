import instance from '@/utils/axios.util';

const tax = {
    taxList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `tax_list/`;
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

export default tax;
