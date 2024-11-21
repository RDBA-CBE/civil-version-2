import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import Models from '@/imports/models.import';
import moment from 'moment';
import CommonLoader from '@/components/commonLoader';

const Logs = () => {
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        GetLogData();
    }, []);

    const GetLogData = async () => {
        try {
            setLoading(true);
            const res = await Models.logs.logList();
            tableFormat(res);
            setLoading(false);
        } catch (error) {
            setLoading(false);

            console.log('error: ', error);
        }
        const Token = localStorage.getItem('token');
    };

    const tableFormat = (res: any) => {
        const data = res?.map((item: any) => ({
            ...item,
            userName: item?.user?.username,
            login_at: moment(item?.login_at).format('YYYY-MM-DD HH:mm:ss a'),
            action: item?.action,
            ip: item?.login_ip,
        }));

        setData(data);
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'userName',
            key: 'userName',
            className: 'singleLineCell',
        },
        {
            title: 'Login At',
            dataIndex: 'login_at',
            key: 'login_at',
            className: 'singleLineCell',
        },
        {
            title: 'IP',
            dataIndex: 'ip',
            key: 'ip',
            className: 'singleLineCell',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            className: 'singleLineCell',
        },
    ];

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    return (
        <>
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Logs</h1>
                    </div>
                </div>
                {loading ? (
                    <CommonLoader />
                ) : (
                    <div className="table-responsive">
                        <Table dataSource={data} columns={columns} pagination={false} scroll={scrollConfig} />
                    </div>
                )}
            </div>
        </>
    );
};

export default Logs;
