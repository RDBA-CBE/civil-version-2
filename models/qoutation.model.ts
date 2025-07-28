import instance from '@/utils/axios.util';

const qoutation = {
    qoutationList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `quotation/?page=${page}`;
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

    detail: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `quotation-items/${id}/`;
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

    

     filter: (body: any, page: any) => {
            let promise = new Promise((resolve, reject) => {
                let url = `quotation/?page=${page}`;
                if (body?.completed !== undefined) {
                    url += `&completed=${encodeURIComponent(body.completed)}`;
                }
                if (body?.customer) {
                    url += `&customer=${encodeURIComponent(body.customer)}`;
                }
                if (body?.to_date) {
                    url += `&to_date=${encodeURIComponent(body.to_date)}`;
                }
                if (body?.from_date) {
                    url += `&from_date=${encodeURIComponent(body.from_date)}`;
                }
                
    
                instance()
                    .get(url, body)
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