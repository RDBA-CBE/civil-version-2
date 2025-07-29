import instance from '@/utils/axios.util';

const expenseEntry = {
    expenseEntryList: (page: any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `expense_entry/?page=${page}`;
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
                let url = `expense_entry/?page=${page}`;
                if (body?.expense_user) {
                    url += `&expense_user=${encodeURIComponent(body.expense_user)}`;
                }
                if (body?.expense_category) {
                    url += `&expense_category=${encodeURIComponent(body.expense_category)}`;
                }
                if (body?.to_date) {
                    url += `&to_date=${encodeURIComponent(body.to_date)}`;
                }
                if (body?.from_date) {
                    url += `&from_date=${encodeURIComponent(body.from_date)}`;
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
}

export default expenseEntry;