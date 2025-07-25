import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import Models from '@/imports/models.import';
import moment from 'moment';
import CommonLoader from '@/components/commonLoader';
import { useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';

const Software_Logs = () => {
    const [state, setState] = useSetState({
        logList: [],
        currentPage: 1,
    });

    useEffect(() => {
        getData(state.currentPage);
    }, []);

    const getData = async (page: number) => {
        try {
            setState({ loading: true });
            const res = await Models.logs.softwareLogList(page, null);
            setState({ loading: false });

            // tableFormat(res, page);
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const tableFormat = (res: any, page: number) => {
        const data = res?.map((item: any) => ({
            ...item,
            userName: item?.user?.username,
            login_at: moment(item?.login_at).format('YYYY-MM-DD HH:mm:ss a'),
            action: item?.action,
            ip: item?.login_ip,
        }));
        setState({ logList: data, total: res?.length, currentPage: page, loading: false });
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

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        getData(number);

        return number;
    };

    return (
        <>
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Software Logs</h1>
                    </div>
                </div>

                <div className="table-responsive">
                    <Table dataSource={state.logList} columns={columns} pagination={false} scroll={scrollConfig} loading={state.loading} />
                    {state.logList?.length > 0 && (
                        <div>
                            <div
                                className="mb-20 "
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Pagination totalPage={state.total} itemsPerPage={10} currentPages={state.currentPage} activeNumber={handlePageChange} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Software_Logs;
