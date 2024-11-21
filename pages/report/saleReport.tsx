import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, DatePicker, Select, Tooltip, Spin } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const SaleReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [saleFormData, setSaleFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        axios
            .get(`${baseUrl}/sale_report/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setSaleFormData(res.data.reports);
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
            title: (
                <Tooltip title="Date">
                    <span>Date</span>
                </Tooltip>
            ),
            title1: 'Date',
            dataIndex: 'export_date',
            key: 'export_date',
            className: 'singleLineCell',
        },
        {
            title: (
                <Tooltip title="Invoice No">
                    <span>Invoice No</span>
                </Tooltip>
            ),
            title1: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            width: 100,
        },
        {
            title: (
                <Tooltip title="Customer Name">
                    <span>Customer Name</span>
                </Tooltip>
            ),
            title1: 'Customer Name',
            dataIndex: 'customer_name',
            key: 'customer_name',
            className: 'singleLineCell',
        },
        {
            title: (
                <Tooltip title="Completed">
                    <span>Completed</span>
                </Tooltip>
            ),
            title1: 'Completed',
            dataIndex: 'completed',
            key: 'completed',
            className: 'singleLineCell',
        },
        {
            title: (
                <Tooltip title="Customer GST No">
                    <span>Customer GST No</span>
                </Tooltip>
            ),
            title1: 'Customer GST No',
            dataIndex: 'customer_gst_no',
            key: 'customer_gst_no',
            className: 'singleLineCell',
        },
        {
            title: (
                <Tooltip title="Project Name">
                    <span>Project Name</span>
                </Tooltip>
            ),
            title1: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            className: 'singleLineCell',
        },

        {
            title: (
                <Tooltip title="Advance">
                    <span>Advance</span>
                </Tooltip>
            ),

            title1: 'Advance',
            dataIndex: 'advance',
            key: 'advance',
            className: 'singleLineCell',
        },

        {
            title: (
                <Tooltip title="Balance">
                    <span>Balance</span>
                </Tooltip>
            ),

            title1: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            className: 'singleLineCell',
            width: 120,
        },

        {
            title: (
                <Tooltip title="Cheque No">
                    <span>Cheque No</span>
                </Tooltip>
            ),

            title1: 'Cheque No',
            dataIndex: 'cheque_neft',
            key: 'cheque_neft',
            className: 'singleLineCell',
            width: 120,
        },

        {
            title: (
                <Tooltip title="UPI">
                    <span>UPI</span>
                </Tooltip>
            ),

            title1: 'UPI',
            dataIndex: 'upi',
            key: 'upi',
            className: 'singleLineCell',
            width: 100,
        },
        {
            title: (
                <Tooltip title="Neft">
                    <span>Neft</span>
                </Tooltip>
            ),

            title1: 'Neft',
            dataIndex: 'neft',
            key: 'neft',
            className: 'singleLineCell',
            width: 100,
        },

        {
            title: (
                <Tooltip title="TDS">
                    <span>TDS</span>
                </Tooltip>
            ),

            title1: 'Tds',
            dataIndex: 'tds',
            key: 'tgs',
            className: 'singleLineCell',
            width: 100,
        },

        {
            title: (
                <Tooltip title="CGST Tax">
                    <span>CGST Tax</span>
                </Tooltip>
            ),

            title1: 'CGST Tax',
            dataIndex: 'cgst_tax',
            key: 'cgst_tax',
            className: 'singleLineCell',
            width: 100,
        },

        {
            title: (
                <Tooltip title="SGST Tax">
                    <span>SGST Tax</span>
                </Tooltip>
            ),
            title1: 'SGST Tax',
            dataIndex: 'sgst_tax',
            key: 'sgst_tax',
            className: 'singleLineCell',
            width: 100,
        },

        {
            title: (
                <Tooltip title="IGST Tax">
                    <span>IGST Tax</span>
                </Tooltip>
            ),
            title1: 'IGST Tax',
            dataIndex: 'igst_tax',
            key: 'igst_tax',
            className: 'singleLineCell',
            width: 100,
        },

        {
            title: (
                <Tooltip title="Total Amount">
                    <span>Total Amount</span>
                </Tooltip>
            ),
            title1: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            className: 'singleLineCell',
            width: 250,
        },
    ];

    useEffect(() => {
        const Token = localStorage.getItem('token');
        setLoading(true);

        const body = {
            project_name: '',
            from_date: '',
            to_date: '',
            customer: '',
        };

        axios
            .post(`${baseUrl}/sale_report/`, body, {
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
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        const body = {
            project_name: values.project_name ? values.project_name : '',
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            customer: values.customer ? values.customer : '',
        };

        axios
            .post(`${baseUrl}/sale_report/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res?.data?.reports);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
        form.resetFields();
    };

    const onFinishFailed = (errorInfo: any) => {};

    type FieldType = {
        project_name?: string;
        from_date?: string;
        to_date?: string;
        customer?: string;
    };

    // export to excel format
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Add header row
        worksheet.addRow(columns.map((column) => column.title1));

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
            'Sales-Report.xlsx'
        );
    };

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <div className="sale_report_inputs">
                            <Form.Item<FieldType> label="Project Name" name="project_name" style={{ width: '250px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="Customer" name="customer" style={{ width: '300px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.customer_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <div style={{ display: 'flex', alignItems: 'end' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '200px' }}>
                                        Search
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Sales Report</h1>
                    </div>
                    <div>
                        <button type="button" onClick={exportToExcel} className="create-button">
                            Export to Excel{' '}
                        </button>
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

export default SaleReport;
