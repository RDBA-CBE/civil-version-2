import instance from '@/utils/axios.util';

const expense = {
    expenseList: (page: number, body: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense_list/?page=${page}`;
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
                        reject(error.response.data.error);
                    } else {
                        reject(error);
                    }
                });
        });
        return promise;
    },
};

export default expense;
