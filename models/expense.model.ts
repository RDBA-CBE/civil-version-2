import instance from '@/utils/axios.util';

const expense = {
    expenseList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense/?page=${page}`;
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

     expenseSearch: (name: any) => {
            let promise = new Promise((resolve, reject) => {
                let url = `expense/?search=${name}`;
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

    create: (body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense/`;

            instance()
                .post(url, body)
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

    update: (id: any, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense/${id}/`;

            instance()
                .patch(url, body)
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

    delete: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense/${id}/`;
            instance()
                .delete(url)
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

    detail: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense/${id}/`;
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

    expenseEntryDetail: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense-entry/${id}/`;
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

    expenseFileReport: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-file/?page=${page}&category=3`;
            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }

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

    invoiceFileReport: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-file/?page=${page}&category=2`;
            if (body?.search) {
                url += `&search=${encodeURIComponent(body.search)}`;
            }

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

export default expense;
