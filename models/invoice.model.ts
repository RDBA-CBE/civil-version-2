import instance from '@/utils/axios.util';

const invoice = {
    invoiceList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice/?page=${page}`;
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

    invoiceSearch: (name: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice/?search=${name}`;
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

    createInvoiceDiscount: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-discount/`;
            instance()
                .post(url, data)
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

    updateInvoiceDiscount: (id: any, data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-discount/${id}/`;
            instance()
                .patch(url, data)
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

    getInvoiceDiscount: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-discount/${id}/`;
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

    createInvoice: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice/`;
            instance()
                .post(url, data)
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
            let url = `invoice/?page=${page}`;
            if (body?.completed) {
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
            if (body?.project_name) {
                url += `&project_name=${encodeURIComponent(body.project_name)}`;
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
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    editInvoice: (invoiceId: any, data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice/${invoiceId}/`;
            instance()
                .patch(url, data)
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

    deleteInvoice: (invoiceId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice/${invoiceId}/`;
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

    customerList: (page = 1) => {
        let promise = new Promise((resolve, reject) => {
            let url = `customer/?page=${page}`;
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

    customerSearch: (name: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `customer/?search=${name}`;
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

    testList: (invoiceId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-test/?invoice=${invoiceId}&pagination=false`;
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

    paymentList: (invoiceId: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `receipt/?invoice_no=${invoiceId}&pagination=false`;
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

    customerDetails: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `customer/${id}`;
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

    materialNameList: () => {
        let promise = new Promise((resolve, reject) => {
            let url = `get_material_test/`;
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
                        reject(error.response.data);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    invoiceDetails: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice/${id}/`;
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

    createTest: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-test/`;
            instance()
                .post(url, data)
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

    updateTest: (id: any, data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-test/${id}/`;
            instance()
                .patch(url, data)
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

    deleteTest: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-test/${id}/`;
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

    getTest: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-test/${id}/`;
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

    updateInvoice: (id: any, data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `edit_invoice/${id}/`;
            instance()
                .put(url, data)
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

    addPayment: (data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `receipt/`;
            instance()
                .post(url, data)
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

    updatePayment: (id: any, data: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `receipt/${id}/`;
            instance()
                .patch(url, data)
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

    deletePayment: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `receipt/${id}/`;
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

    getPayment: (id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `receipt/${id}/`;
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

    updateInvoiceTax: (invoiceId: any, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-taxes/${invoiceId}/`;
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
};

export default invoice;
