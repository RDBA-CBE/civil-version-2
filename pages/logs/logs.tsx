import React, { useState, useEffect } from 'react';
import Models from '@/imports/models.import';
import moment from 'moment';
import CommonLoader from '@/components/commonLoader';
import { useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import { Form, Input, Table, Spin } from 'antd';
import useDebounce from '@/components/useDebounce/useDebounce';

const Logs = () => {
    const { Search } = Input;

    const [state, setState] = useSetState({
        logList: [],
        currentPage: 1,
    });

    useEffect(() => {
        getData(state.currentPage);
    }, []);
    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        getData(state.currentPage);
    }, [debouncedSearch]);

    const getData = async (page: number) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res = await Models.logs.logList(page, body);
            tableFormat(res, page);
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const bodyData = () => {
        const body: any = {};
        if (state.search) {
            body['search'] = state.search;
        }
        return body;
    };

    const tableFormat = (res: any, page: number) => {
        const data = res?.results?.map((item: any) => ({
            ...item,
            userName: item?.user?.username,
            login_at: moment(item?.login_at).format('YYYY-MM-DD HH:mm:ss a'),
            action: item?.action,
            ip: item?.login_ip,
            role: item?.user?.groups?.length > 0 ? item?.user?.groups[0]?.name : '',
        }));
        setState({ logList: data, total: res?.count, currentPage: page, loading: false });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'userName',
            key: 'userName',
            className: 'singleLineCell',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
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
                <div className="tax-heading-main justify-between items-center mb-4 flex">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Logs</h1>
                    </div>
                    <div>
                        <Search placeholder="Search IP Address" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <Search placeholder="Search IP Address" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                   
                    </div>

                    <div>
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

export default Logs;
