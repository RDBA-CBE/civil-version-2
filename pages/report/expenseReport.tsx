import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin } from 'antd';
import { Input } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, ObjIsEmpty, roundNumber, useSetState, Dropdown, commomDateFormat } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';

const ExpenseReport = () => {
    const [form] = Form.useForm();

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        expenseList: [],
        search: '',
        btnLoading: false,
        expenseCatHasNext: null,
        expenseCatCurrentPage: 1,
        expenseCatList: [],
    });

    // get GetExpenseReport datas
    useEffect(() => {
        initialData(1);
        expenseCatList(1);
    }, []);

    const initialData = async (page: any) => {
        try {
            setState({ loading: true });

            const res: any = await Models.expenseEntry.expenseEntryList(page);
            setState({
                expenseList: res?.results,
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });
            console.log('✌️error --->', error);
        }
    };

    const expenseCatList = async (page = 1) => {
        try {
            const res: any = await Models.expense.expenseList(page, undefined);
            const dropdown = Dropdown(res?.results, 'expense_name');
            setState({ expenseCatList: dropdown, expenseCatHasNext: res?.next, expenseCatCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const expenseCatSearch = async (text: any) => {
        try {
            const res: any = await Models.expense.expenseSearch(text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'expense_name');
                setState({ expenseCatList: dropdown, expenseCatHasNext: res?.next, expenseCatCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const expenseCatLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.expense.expenseList(page, undefined);
            const dropdown = Dropdown(res?.results, 'expense_name');
            setState({ expenseCatList: [...state.expenseCatList, ...dropdown], expenseCatHasNext: res?.next, expenseCatCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    // Table Headers
    const columns = [
        {
            title: 'Expense User',
            dataIndex: 'expense_user',
            key: 'expense_user',
            className: 'singleLineCell',
        },
        {
            title: 'Expense Category',
            dataIndex: 'expense_category_name',
            key: 'expense_category',
            className: 'singleLineCell',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },
        {
            title: 'Narration',
            dataIndex: 'narration',
            key: 'narration',
            className: 'singleLineCell',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record ? commomDateFormat(record) : ''}</div>;
            },
        },
    ];

    const bodyData = () => {
        const body: any = {};
        if (state.searchValue) {
            if (state.searchValue?.expense_user) {
                body.expense_user = state.searchValue.expense_user;
            }
            if (state.searchValue?.expense_category) {
                body.expense_category = state.searchValue.expense_category;
            }
            if (state.searchValue?.from_date) {
                body.from_date = state.searchValue.from_date;
            }

            if (state.searchValue?.to_date) {
                body.to_date = state.searchValue.to_date;
            }
        }

        return body;
    };

    // export to excel format
    const exportToExcel = async () => {
        setState({ btnloading: true });

        const body = {
            from_date: state.searchValue?.from_date ? dayjs(state.searchValue.from_date).format('YYYY-MM-DD') : '',
            to_date: state.searchValue?.to_date ? dayjs(state.searchValue.to_date).format('YYYY-MM-DD') : '',
            expense_user: state.searchValue?.expense_user || '',
            expense_category: state.searchValue?.expense_category?.value || '',
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        try {
            while (hasNext) {
                let res: any;

                if (!ObjIsEmpty(bodyData())) {
                    res = await Models.expenseEntry.filter(body, currentPage);
                } else {
                    res = await Models.expenseEntry.expenseEntryList(currentPage);
                }

                allData = allData.concat(res?.results || []);
                hasNext = !!res?.next;
                if (hasNext) currentPage += 1;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Expense Report');

            // Add header row using column titles
            worksheet.addRow(columns.map((col) => col.title));

            // Add data rows
            allData.forEach((row: any) => {
                const rowData: any[] = columns.map((col) => {
                    const value = row[col.dataIndex];

                    if (col.dataIndex === 'amount') {
                        return roundNumber(value);
                    }

                    if (col.dataIndex === 'date') {
                        return commomDateFormat(value);
                    }

                    return value ?? ''; // fallback if null/undefined
                });

                worksheet.addRow(rowData);
            });

            const blob = await workbook.xlsx.writeBuffer();

            FileSaver.saveAs(
                new Blob([blob], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
                'Expense-Report.xlsx'
            );
        } catch (error) {
            console.error('Error exporting to Excel:', error);
        } finally {
            setState({ btnloading: false, id: null });
        }
    };

    // form submit
    const onFinish = async (values: any, page = 1) => {
        try {
            setState({ loading: true });

            const body = {
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                expense_user: values.expense_user ? values.expense_user : '',
                expense_category: values.expense_category ? values.expense_category.value : '',
            };

            const res: any = await Models.expenseEntry.filter(body, page);
            setState({
                expenseList: res?.results,
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
                searchValue: values,
            });
        } catch (error) {
            setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });

        const body = bodyData();

        if (!ObjIsEmpty(body)) {
            onFinish(state.searchValue, number);
        } else {
            initialData(number);
        }

        return number;
    };

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <div className="sale_report_inputs">
                            <Form.Item label="Expense User" name="expense_user" style={{ width: '250px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="Expense Category" name="expense_category" style={{ width: '300px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => expenseCatSearch(data)}
                                    value={state.expenseCat}
                                    options={state.expenseCatList}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        form.setFieldsValue({ expense_category: selectedOption });
                                        expenseCatList(1);
                                    }}
                                    loadMore={() => {
                                        if (state.expenseCatHasNext) {
                                            expenseCatLoadMore(state.expenseCatCurrentPage + 1);
                                        }
                                    }}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '10px' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '100px' }}>
                                        Search
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        onClick={() => {
                                            form.resetFields();
                                        }}
                                        style={{ width: '100px' }}
                                    >
                                        Clear
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Expense Report</h1>
                    </div>
                    <div>
                        <Space>
                            <Button type="primary" onClick={exportToExcel}>
                                {state.btnloading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2" /> : 'Export To Excel'}
                            </Button>

                            {/* <Search placeholder="input search text" onChange={inputChange} enterButton className='search-bar' /> */}
                        </Space>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.expenseList}
                        columns={columns}
                        pagination={false}
                        scroll={scrollConfig}
                        loading={{
                            spinning: state.loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>

                {state.expenseList?.length > 0 && (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Pagination totalPage={state.total} itemsPerPage={10} currentPages={state.currentPage} activeNumber={handlePageChange} />
                            {/* <Pagination activeNumber={handlePageChange} totalPages={state.total} currentPages={state.currentPage} /> */}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default ExpenseReport;
