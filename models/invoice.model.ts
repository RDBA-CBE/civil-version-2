

import instance from "@/utils/axios.util";

const invoice = {
    invoiceList: (page:any) => {
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

    
};

export default invoice;
