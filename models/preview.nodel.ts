import instance from '@/utils/axios.util';

const preview = {
    invoicePreview: ( id: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `print_invoice/${id}/`;
          
            instance()
                .get(url)
                .then((res) => {
                    resolve(res.data);
                })
                .catch((error) => {
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

export default preview;
