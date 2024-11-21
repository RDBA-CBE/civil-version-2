import React, { useState, useEffect } from 'react';
import { DatePicker, Form, InputNumber, Select, Space, Table, Spin, Button, Input } from 'antd';
import axios from 'axios';
import * as FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import router from 'next/router';
import dayjs from 'dayjs';
import { baseUrl } from '@/utils/function.util';

const PendingPayment = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [dataSource, setDataSource] = useState([]);
    const [formFields, setFormFields] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios
            .get(`${baseUrl}/create_invoice/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setFormFields(res.data);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
    }, []);

    // Table Datas
    const columns = [
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            width: 100,
            render: (text: any, record: any) => (
                <span style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} onClick={() => handleRowClick(record)}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Customer Name',
            dataIndex: 'customer',
            key: 'customer',
            className: 'singleLineCell',
        },
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            className: 'singleLineCell',
        },
        {
            title: 'Incompleted Test',
            dataIndex: 'incompleted_test',
            key: 'incompleted_test',
            className: 'singleLineCell',
            width: 150,
        },
        {
            title: 'Advance',
            dataIndex: 'advance',
            key: 'advance',
            className: 'singleLineCell',
        },
        {
            title: 'Total-Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            className: 'singleLineCell',
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            className: 'singleLineCell',
        },
    ];

    const handleRowClick = (record: any) => {
        window.location.href = `/invoice/edit?id=${record.id}`;
    };

    // input search
    // const inputChange = (e: any) => {
    //     const SearchValue = e.target.value;

    //     const filteredData = dataSource.filter((item: any) => {
    //         return (
    //             item.invoice_no.includes(SearchValue) ||
    //             item.customer.toLowerCase().includes(SearchValue.toLowerCase()) ||
    //             item.project_name.toLowerCase().includes(SearchValue.toLowerCase()) ||
    //             item.total_amount.includes(SearchValue) ||
    //             item.advance.includes(SearchValue) ||
    //             item.balance.includes(SearchValue) ||
    //             item.incompleted_test.includes(SearchValue)
    //         );
    //     });
    //     setFilterData(filteredData);
    // };

    // export to excel format
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Add header row
        worksheet.addRow(columns.map((column) => column.title));

        // Add data rows
        dataSource.forEach((row: any) => {
            worksheet.addRow(columns.map((column: any) => row[column.dataIndex]));
        });

        // Generate a Blob containing the Excel file
        const blob = await workbook.xlsx.writeBuffer();

        // Use file-saver to save the Blob as a file
        FileSaver.saveAs(
            new Blob([blob], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            'Expense-Report.xlsx'
        );
    };

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    // search

    useEffect(() => {
        initialData();
    }, []);

    const initialData = () => {
        const Token = localStorage.getItem('token');
        setLoading(true);
        const body = {
            project_name: '',
            from_date: '',
            to_date: '',
            customer: '',
            invoice_no: '',
        };

        axios
            .post(`${baseUrl}/pending_payment/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res?.data?.pending_payments);
                setLoading(false);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false);
            });
    };

    // form submit
    const onFinish2 = (values: any) => {
        const Token = localStorage.getItem('token');

        const body = {
            project_name: values.project_name ? values.project_name : '',
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            customer: values.customer ? values.customer : '',
            invoice_no: values.invoice_no ? values.invoice_no : '',
        };

        axios
            .post(`${baseUrl}/pending_payment/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res?.data?.pending_payments);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
        form.resetFields();
    };

    const onFinishFailed2 = (errorInfo: any) => {};

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish2} onFinishFailed={onFinishFailed2} autoComplete="off">
                        <div className="sale_report_inputs">
                            <Form.Item label="Invoice No" name="invoice_no" style={{ width: '200px' }}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="Customer" name="customer" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {formFields?.customer?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.customer_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Project Name" name="project_name" style={{ width: '200px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <div style={{ display: 'flex', alignItems: 'end' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '150px' }}>
                                        Search
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Pending Payment</h1>
                    </div>
                    <div>
                        <Space>
                            <Button type="primary" onClick={exportToExcel}>
                                Export to Excel
                            </Button>
                            {/* <Search placeholder="input search text" onChange={inputChange} enterButton className="search-bar" /> */}
                        </Space>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        scroll={scrollConfig}
                        loading={{
                            spinning: loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>
            </div>
        </>
    );
};

export default PendingPayment;
