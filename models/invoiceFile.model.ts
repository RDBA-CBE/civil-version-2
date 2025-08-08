import instance from '@/utils/axios.util';

const invoiceFile = {
    invoiceFileList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-file/?page=${page}`;
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

    filter: (body: any, page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-file/?page=${page}`;

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

            if (body?.customer) {
                url += `&customer=${encodeURIComponent(body.customer)}`;
            }

            if (body?.project_name) {
                url += `&project_name=${encodeURIComponent(body.project_name)}`;
            }

            instance()
                .get(url, body)
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

    getInvoiceFile: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice_file/${id}/`;
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

export default invoiceFile;
