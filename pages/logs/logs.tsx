import React, { useState, useEffect } from 'react';
import Models from '@/imports/models.import';
import moment from 'moment';
import CommonLoader from '@/components/commonLoader';
import { useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import { Form, Input, Table, Spin, DatePicker } from 'antd';
import useDebounce from '@/components/useDebounce/useDebounce';
import { scrollConfig } from '@/utils/constant';

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

    const debouncedLogin = useDebounce(state.login_ip);

    useEffect(() => {
        getData(1);
    }, [debouncedSearch, debouncedLogin, state.login_at]);

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
        if (state.login_ip) {
            body['login_ip'] = state.login_ip;
        }
        if (state.login_at) {
            body['login_at'] = state.login_at;
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


    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        getData(number);

        return number;
    };

    return (
        <>
            <div className="panel">
                <div className="tax-heading-main mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Logs</h1>
                    </div>
                    <div className="flex gap-4">
                        <Search placeholder="Search Name" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <Search placeholder="Search IP Address" value={state.login_ip} onChange={(e) => setState({ login_ip: e.target.value })} enterButton className="search-bar" />
                        <DatePicker
                            style={{ width: 200 }}
                            placeholder="Select Date"
                            onChange={(date, dateString) => setState({ login_at: dateString })}
                            className="search-bar"
                            value={state.login_at ? moment(state.login_at, 'YYYY-MM-DD') : null}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <Table dataSource={state.logList} columns={columns} pagination={false} scroll={scrollConfig} loading={state.loading} />
                    {state.logList?.length > 0 && (
                        <div>
                            <div
                                
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
