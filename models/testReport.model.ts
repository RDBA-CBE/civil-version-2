import instance from '@/utils/axios.util';

const testReport = {
    testReportList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `invoice-test/?page=${page}`;
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
            let url = `invoice-test/?page=${page}`;

            if (body?.material) {
                url += `&material=${encodeURIComponent(body.material)}`;
            }
            if (body?.to_date) {
                url += `&to_date=${encodeURIComponent(body.to_date)}`;
            }
            if (body?.from_date) {
                url += `&from_date=${encodeURIComponent(body.from_date)}`;
            }

            if (body?.customer) {
                url += `&customer=${encodeURIComponent(body.customer)}`;
            }

            if (body?.test) {
                url += `&test=${encodeURIComponent(body.test)}`;
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
};

export default testReport;
