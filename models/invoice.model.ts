import instance from '@/utils/axios.util';

const invoice = {
    invoiceList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice_list/?page=${page}`;
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

    getInvoiceDetails: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `edit_invoice/${id}/`;
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

    updateInvoice: (id: any,data:any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `edit_invoice/${id}/`;
            instance()
                .put(url,data)
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

export default invoice;
