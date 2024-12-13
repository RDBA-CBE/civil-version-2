import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin } from 'antd';
import { Input } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ExpenseFileReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);


    // Table Headers
    const columns = [
        {
            title: 'Expense User',
            dataIndex: 'expense_user',
            key: 'expense_user',
            className: 'singleLineCell',
        },
        {
            title: 'Expense Amount',
            dataIndex: 'expense_amount',
            key: 'expense_amount',
            className: 'singleLineCell',
        },
        {
            title: 'File',
            dataIndex: 'file',
            key: 'file',
            className: 'singleLineCell',
            render: (text:any, record:any) => (
                <a href={record.file} target="_blank" rel="noopener noreferrer">Download</a>
            ),
        },
        {
            title: 'Expense Date',
            dataIndex: 'expense_date',
            key: 'expense_date',
            className: 'singleLineCell',
        },
    ];

    // export to excel format
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Add header row
        worksheet.addRow(columns.map((column) => column.title));

        // Add data rows
      // Add data rows
        dataSource.forEach((row) => {
            const rowData:any = [];
            columns.forEach((column) => {
                if (column.dataIndex === 'file') {
                    // Add hyperlink in the specific column
                    rowData.push({
                        text: row[column.dataIndex], // Text displayed for the link
                        hyperlink: row[column.dataIndex], // URL for the link
                    });
                } else {
                    rowData.push(row[column.dataIndex]);
                }
            });
            worksheet.addRow(rowData);
        });


        // Generate a Blob containing the Excel file
        const blob = await workbook.xlsx.writeBuffer();

        // Use file-saver to save the Blob as a file
        FileSaver.saveAs(
            new Blob([blob], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            'Expense-File-Report.xlsx'
        );
    };

    useEffect(() => {
        const Token = localStorage.getItem('token');
        setLoading(true)
        const body = {
            // expense_user: '',
            from_date: '',
            to_date: '',
            // expense_category: '',
        };

        axios
            .post(`${baseUrl}/expense_file_report/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                console.log('✌️res --->', res);
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
        const Token = localStorage.getItem('token');

        const body = {
            // expense_user: values.expense_user ? values.expense_user : '',
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            // expense_category: values.expense_category ? values.expense_category : '',
        };

        axios
            .post(`${baseUrl}/expense_file_report/`, body, {
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

    const scrollConfig: any = {
        x: true,
        y: 300,
    };



    // download 
    const handleDownloadAll = () => {
        console.log("dataSource", dataSource);
    
        // Create a new jsPDF instance
        const doc: any = new jsPDF();
    
        // Adding a title to the PDF
        doc.text('Expense File Report', 14, 16);
    
        // Define the column headers
        const headers = ['ID', 'Expense User', 'Expense Amount', 'Expense Date', 'File'];
    
        // Map the data into the table format
        const tableData = dataSource.map((item: any) => [
            item.id, // ID
            item.expense_user, // Expense User
            item.expense_amount, // Expense Amount
            dayjs(item.expense_date).format('DD-MM-YYYY'), // Expense Date (formatted)
            {
                content: item.file, // URL to the file
                link: item.file, // URL should be a clickable link in the PDF
            }
        ]);
    
        // Use the autoTable plugin to generate the table in the PDF
        doc.autoTable({
            head: [headers], // Table header
            body: tableData, // Table rows
            startY: 20, // Starting Y position for the table
            margin: { horizontal: 10 },
            theme: 'striped',
            columnStyles: {
                0: { cellWidth: 20 },  // Column 1 (ID) - small width
                1: { cellWidth: 50 },  // Column 2 (Expense User) - wider
                2: { cellWidth: 40 },  // Column 3 (Expense Amount) - medium width
                3: { cellWidth: 30 },  // Column 4 (Expense Date) - medium width
                4: { cellWidth: 100 },  // Column 5 (File) - wide width for the link column
            },
        });
    
        // Save the PDF with the name "Expense_File_Report.pdf"
        doc.save('Expense_File_Report.pdf');
    };


    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <div className="sale_report_inputs">
                            {/* <Form.Item label="Expense User" name="expense_user" style={{ width: '250px' }}>
                                <Input />
                            </Form.Item> */}
                            <Space>
                                <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>

                                <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
                                    <DatePicker style={{ width: '100%' }} />
                                </Form.Item>
                            </Space>

                            {/* <Form.Item label="Expense Category" name="expense_category" style={{ width: '300px' }}>
                                <Select>
                                    {saleFormData?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.expense_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item> */}

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
                        <h1 className="text-lg font-semibold dark:text-white-light">Expense File Report</h1>
                    </div>
                    <div>
                        <Space>
                            <Button type="primary" onClick={exportToExcel}>
                                Export to Excel
                            </Button>
                            <Button type="primary" onClick={handleDownloadAll}>
                                Download PDF
                            </Button>
                            {/* <Search placeholder="input search text" onChange={inputChange} enterButton className='search-bar' /> */}
                        </Space>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table dataSource={dataSource} columns={columns} pagination={false} scroll={scrollConfig} 
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

export default ExpenseFileReport;
