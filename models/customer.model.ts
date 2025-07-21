import instance from '@/utils/axios.util';

    const customer = {

         costomerList: (page: any) => {
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
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },

    employeeList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `employee_list/?page=${page}`;
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



    }

    export default customer;