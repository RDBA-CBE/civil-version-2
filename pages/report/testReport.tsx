import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, DatePicker, Select, Spin } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const TestReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [saleFormData, setSaleFormData] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios
            .get(`${baseUrl}/test-list/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
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
    }, []);

    console.log('saleFormData', saleFormData);

    // Table Datas
    const columns = [
        {
            title: 'Test Name',
            dataIndex: 'test_name',
            key: 'test_name',
            className: 'singleLineCell',
        },
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
            className: 'singleLineCell',
        },
        {
            title: 'Material Name',
            dataIndex: 'material_name',
            key: 'material_name',
            className: 'singleLineCell',
        },
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            render: (text:any, record:any) => (
                <a href={`/invoice/edit?id=${record.invoice}`}  rel="noopener noreferrer">{record.invoice_no}</a>
            ),
        },

        {
            title: 'Completed',
            dataIndex: 'completed',
            key: 'completed',
            className: 'singleLineCell',
            width: 150,
        },
        {
            title: 'Date',
            dataIndex: 'created_date',
            key: 'created_date',
            className: 'singleLineCell',
        },
    ];

    useEffect(() => {
        const Token = localStorage.getItem('token');
        console.log('✌️Token --->', Token);
        setLoading(true)
        const body = {
            test: '',
            from_date: '',
            to_date: '',
            customer: '',
            material: '',
        };

        axios
            .post(`${baseUrl}/test-list/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res?.data?.reports);
                setLoading(false)
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false)
            });
    }, []);

    // form submit
    const onFinish = (values: any) => {
        console.log('✌️values --->', values);
        const Token = localStorage.getItem('token');

        const body = {
            test: values.test ? values.test : '',
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            customer: values.customer ? values.customer : '',
            material: values.material ? values.material : '',
        };
        console.log('✌️body --->', body);

        axios
            .post(`${baseUrl}/test-list/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                console.log('✌️res --->', res);
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
            'Test-Report.xlsx'
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
                            <Form.Item label="Test" name="test" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.tests?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.test_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Customer" name="customer" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.customers?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.customer_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Material" name="material" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.materials?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.material_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Test Report</h1>
                    </div>
                    <div>
                        <button type="button" onClick={exportToExcel} className="create-button">
                            Export to Excel{' '}
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <Table dataSource={dataSource} columns={columns} scroll={scrollConfig} 
                      loading={{
                        spinning: loading, // This enables the loading spinner
                        indicator: <Spin size="large"/>,
                        tip: 'Loading data...', // Custom text to show while loading
                    }}/>
                </div>
            </div>
        </>
    );
};

export default TestReport;
