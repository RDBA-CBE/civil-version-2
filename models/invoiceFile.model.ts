import instance from '@/utils/axios.util';

const invoiceFile = {
    invoiceFileList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice_file/?page=${page}`;
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
                let url = `invoice_file/?page=${page}`;
             
                if (body?.category_name) {
                    url += `&category=${encodeURIComponent(body.category_name)}`;
                }
                if (body?.to_date) {
                    url += `&to_date=${encodeURIComponent(body.to_date)}`;
                }
                if (body?.from_date) {
                    url += `&from_date=${encodeURIComponent(body.from_date)}`;
                }
               

            if (body?.invoice_no) {
                url += `&invoice_no=${encodeURIComponent(body.invoice_no)}`;
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

export default invoiceFile;