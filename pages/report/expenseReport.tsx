import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin } from 'antd';
import { Input } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, ObjIsEmpty, roundNumber, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';

const ExpenseReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [saleFormData, setSaleFormData] = useState<any>([]);
    const [loading, setLoading] = useState(false);

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
    });

    // get GetExpenseReport datas
    useEffect(() => {
        GetExpenseReport();
        initialData(1);
    }, []);

    const GetExpenseReport = () => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/create_expense_entry/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setSaleFormData(res.data);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
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
                return <div>{record ? moment(record).format('DD-MM-YYYY') : ''}</div>;
            },
        },
    ];

    const button = [
        {
            id: 1,
            name: 'Export to Excel',
        },
        {
            id: 2,
            name: 'Download PDF',
        },
    ];

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
            expense_category: state.searchValue?.expense_category || '',
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

    useEffect(() => {
        const Token = localStorage.getItem('token');
        setLoading(true);
        const body = {
            expense_user: '',
            from_date: '',
            to_date: '',
            expense_category: '',
        };

        axios
            .post(`${baseUrl}/expense_report/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res?.data?.reports);
                setLoading(false);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false);
            });
    }, []);

    // form submit
    const onFinish = async (values: any, page = 1) => {
        console.log('values', values);

        try {
            setState({ loading: true });

            const body = {
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                expense_user: values.expense_user ? values.expense_user : '',
                expense_category: values.expense_category ? values.expense_category : '',
            };

            console.log('body', body);

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

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

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
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.expense?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.expense_name}
                                        </Select.Option>
                                    ))}
                                </Select>
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
                            className="mb-20 "
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
