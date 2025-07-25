import instance from "@/utils/axios.util";

const logs = {
    logList: (page:number,body:any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `user-logs/?page=${page}`;
            // http://127.0.0.1:8000/user-logs/?user=5&action=LOGIN&login_at=&details=&login_ip=&search=
            if (body?.search) {
                url += `&login_ip=${encodeURIComponent(body.search)}`;
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


    softwareLogList: (page:number,body:any) => {
        let promise = new Promise((resolve, reject) => {
            let url = `audit-logs/?page=${page}`;
            // http://127.0.0.1:8000/user-logs/?user=5&action=LOGIN&login_at=&details=&login_ip=&search=
            // if (body?.search) {
            //     url += `&login_ip=${encodeURIComponent(body.search)}`;
            // }
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

export default logs;
