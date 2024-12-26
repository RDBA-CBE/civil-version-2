import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin, InputNumber } from 'antd';
import { Input } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';
import {jsPDF} from 'jspdf';
import 'jspdf-autotable';

const InvoiceReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [saleFormData, setSaleFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formFields, setFormFields] = useState<any>([]);

    // get GetExpenseReport datas
    useEffect(() => {
        GetExpenseReport();
    }, []);

    const GetExpenseReport = () => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/expense_report/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setSaleFormData(res.data?.expense_category);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
    };

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

    // Table Headers
    const columns = [
        {
            title: 'Customer',
            dataIndex: 'customer',
            key: 'customer',
            className: 'singleLineCell',
                    
        },
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            className: 'singleLineCell',
            width: 150,
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'discount',
            className: 'singleLineCell',
            width: 150,
        },

        // {
        //     title: 'Tax',
        //     dataIndex: 'tax',
        //     key: 'tax',
        //     className: 'singleLineCell',
        //     width: 150,
        // },
     
        // {
        //     title: 'File',
        //     dataIndex: 'file',
        //     key: 'file',
        //     className: 'singleLineCell',
        //     render: (text:any, record:any) => (
        //         <a href={record.file} target="_blank" rel="noopener noreferrer">Download</a>
        //     ),
        // },
        {
            title: 'Advance Amount',
            dataIndex: 'advance',
            key: 'advance',
            className: 'singleLineCell',
        },
        {
            title: 'Balance Amount',
            dataIndex: 'balance',
            key: 'balance',
            className: 'singleLineCell',
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            className: 'singleLineCell',
        },
        {
            title: 'TDS Amount',
            dataIndex: 'tds_amount',
            key: 'tds_amount',
            className: 'singleLineCell',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            className: 'singleLineCell',
        },
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
        },
        // {
        //     title: 'Invoice Image',
        //     dataIndex: 'invoice_image',
        //     key: 'invoice_image',
        //     className: 'singleLineCell',
        // },
        {
            title: 'Completed',
            dataIndex: 'completed',
            key: 'completed',
            className: 'singleLineCell',
        },
    
        {
            title: 'Place Of Testing',
            dataIndex: 'place_of_testing',
            key: 'place_of_testing',
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
            'Invoice-File-Report.xlsx'
        );
    };

    useEffect(() => {
        const Token = localStorage.getItem('token');
        setLoading(true)
        const body = {
            // expense_user: '',
            from_date: '',
            to_date: '',
            invoice_no:"",
            project_name:"",
            customer:""
            // expense_category: '',
        };

        axios
        .get(`${baseUrl}/invoice-reports/`, {
            headers: {
                Authorization: `Token ${Token}`,
            },
            params: {...body}
        })
            
            .then((res: any) => {
                console.log('✌️res --->', res);
                const data = res?.data.map((item:any)=>{return item.invoice})

                // console.log(res?.data.map((item:any)=>{return item.invoice}));
                
                // console.log(data);
                
                setDataSource(data);
                setLoading(false)
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false)
            });
    }, []);

    console.log("data",dataSource);
    
   
    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        const body = {
           
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            invoice_no:values?.invoice_no ? values?.invoice_no : '',
            project_name:values?.project_name?values?.project_name:"",
            customer:values?.customer?values?.customer:""
        };

        axios
        .get(`${baseUrl}/invoice-reports/`, {
            headers: {
                Authorization: `Token ${Token}`,
            },
            params: {...body}
        })
            .then((res: any) => {
                const data = res?.data?.map((item:any)=>{return item.invoice})

                setDataSource(data);
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
        doc.text('Invoice Report', 14, 16);
    
        // Define the column headers
        const headers = ['Customer', 'Project Name', 'Discount', 'Advance Amount', 'Balance Amount',"Total Amount", "Tds Amount","Invoice No", "Place Of Testing", "Completed","Invoice Tests", "Date"];
    
        // Map the data into the table format
        const tableData = dataSource.map((item: any) => { console.log(item); 
            return [ 
            item.customer, // ID
            item.project_name, // Expense User
            item.discount, 
            item.advance,
            item.balance,
            item.total_amount,
            item.tds_amount,
            item.invoice_no,
            item.place_of_testing,
            item.completed,
            dayjs(item.date).format('DD-MM-YYYY'), // Expense Date (formatted)
            // {
            //     content: item.file, // URL to the file
            //     link: item.file, // URL should be a clickable link in the PDF
            // }
        ]});
        console.log(tableData);
        
    
        // Use the autoTable plugin to generate the table in the PDF
        doc.autoTable({
            head: [headers], // Table header
            body: tableData, // Table rows
            startY: 20, // Starting Y position for the table
            margin: { horizontal: 10 },
            theme: 'striped',
            // columnStyles: {
            //     0: { cellWidth: 20 },  // Column 1 (ID) - small width
            //     1: { cellWidth: 20 },  // Column 2 (Expense User) - wider
            //     2: { cellWidth: 20 },  // Column 3 (Expense Amount) - medium width
            //     3: { cellWidth: 20 },  // Column 4 (Expense Date) - medium width
            //     4: { cellWidth: 20 },  // Column 5 (File) - wide width for the link column
            //     5: { cellWidth: 20 },
            //     6: { cellWidth: 20 },
            //     7: { cellWidth: 20 },
            //     8: { cellWidth: 10 },
            //     9: { cellWidth: 10 },
            //     10: { cellWidth: 10 },
            //     11: { cellWidth: 10 },

            // },
        });
    
        // Save the PDF with the name "Expense_File_Report.pdf"
        doc.save('Invoice_Report.pdf');
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Invoice Report</h1>
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

export default InvoiceReport;
