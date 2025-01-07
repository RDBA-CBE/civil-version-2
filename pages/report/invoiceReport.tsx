import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin, InputNumber, Tooltip } from 'antd';
import { Input } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import IconEye from '@/components/Icon/IconEye';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import html2canvas from 'html2canvas';

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
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
        },
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
            title: 'Advance',
            dataIndex: 'advance',
            key: 'advance',
            className: 'singleLineCell',
        },
        // {
        //     title: 'Discount',
        //     dataIndex: 'discount',
        //     key: 'discount',
        //     className: 'singleLineCell',
        //     width: 150,
        // },

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
            title: 'Total Amount',
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
        {
            title: 'Invoice Date',
            dataIndex: 'date',
            key: 'date',
            className: 'singleLineCell',
            width: 150,
        },
        {
            title: 'File',
            dataIndex: 'invoice_file',
            key: 'invoice_file',
            className: 'singleLineCell',
            width: 150,
            render: (text: any, record: any) => {
                console.log('✌️record --->', record?.invoice_file);
                return (
                    <>
                        {record?.invoice_file ? (
                            <a href={record.invoice_file} target="_blank" rel="noopener noreferrer">
                                Download
                            </a>
                        ) : (
                            'No File'
                        )}
                    </>
                );
            },
        },
        // {
        //     title: 'TDS Amount',
        //     dataIndex: 'tds_amount',
        //     key: 'tds_amount',
        //     className: 'singleLineCell',
        // },
        // {
        //     title: 'Date',
        //     dataIndex: 'date',
        //     key: 'date',
        //     className: 'singleLineCell',
        // },

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
        // {
        //     title: `Actions`,
        //     dataIndex: 'actions',
        //     key: 'actions',
        //     className: 'singleLineCell',
        //     render: (text: any, record: any) => {
        //         console.log('✌️record --->', record);
        //         return (
        //             <Space>
        //                 <Tooltip title="View Invoice Preview">
        //                     <EyeOutlined style={{ fontSize: '18px' }} onClick={() => router.push(`/invoice/preview?id=${record.id}`)} aria-label="View Invoice Preview" />
        //                 </Tooltip>
        //                 <Tooltip title="Download Invoice">
        //                     <DownloadOutlined style={{ fontSize: '18px' }} onClick={() => handleDownloadPDF(record)} aria-label="Download Invoice" />
        //                 </Tooltip>
        //             </Space>
        //         );
        //     },
        // },

        // {
        //     title: 'Place Of Testing',
        //     dataIndex: 'place_of_testing',
        //     key: 'place_of_testing',
        //     className: 'singleLineCell',
        // },
    ];

    // export to excel format
    const exportToExcel = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Add header row
        worksheet.addRow(columns.map((column) => column.title));

        // Add data rows

        dataSource.forEach((row) => {
            const rowData: any = [];
            columns.forEach((column) => {
                if (column.dataIndex === 'invoice_file') {
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
            'Invoice-Report.xlsx'
        );
    };

    useEffect(() => {
        const Token = localStorage.getItem('token');
        setLoading(true);
        const body = {
            // expense_user: '',
            start_date: '',
            end_date: '',
            invoice_number: '',
            project_name: '',
            customer: '',
            // expense_category: '',
        };

        axios
            .get(`${baseUrl}/invoice-reports/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
                params: { ...body },
            })

            .then((res: any) => {
                console.log('✌️res --->', res);
                const data = res?.data.map((item: any) => {
                    return item.invoice;
                });

                // console.log(res?.data.map((item:any)=>{return item.invoice}));

                // console.log(data);

                setDataSource(data);
                setLoading(false);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false);
            });
    }, []);

    console.log('data', dataSource);

    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        const body = {
            start_date: values?.start_date ? dayjs(values?.start_date).format('YYYY-MM-DD') : '',
            end_date: values?.end_date ? dayjs(values?.end_date).format('YYYY-MM-DD') : '',
            invoice_number: values?.invoice_no ? values?.invoice_no : '',
            project_name: values?.project_name ? values?.project_name : '',
            customer: values?.customer ? values?.customer : '',
        };

        axios
            .get(`${baseUrl}/invoice-reports/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
                params: { ...body },
            })
            .then((res: any) => {
                const data = res?.data?.map((item: any) => {
                    return item.invoice;
                });

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
        console.log('dataSource', dataSource);

        const doc: any = new jsPDF();
        doc.text('Invoice Report', 14, 16);

        const headers = ['Invoice No', 'Customer', 'Project Name', 'Advance Amount', 'Total Amount', 'Balance Amount', 'Date', 'File', 'Completed'];

        const tableData = dataSource.map((item: any) => {
            console.log(item);
            return [
                item.invoice_no,
                item.customer,
                item.project_name,
                item.advance,
                item.total_amount,
                item.balance,
                dayjs(item.date).format('DD-MM-YYYY'),
                item.invoice_file, // This is your "File" column
                item.completed,
            ];
        });

        console.log(tableData);

        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: 20,
            margin: { horizontal: 1 },
            theme: 'striped',
            columnStyles: {
                0: { cellWidth: 20 }, // Column 1 (ID) - small width
                1: { cellWidth: 20 }, // Column 2 (Expense User) - wider
                2: { cellWidth: 20 }, // Column 3 (Expense Amount) - medium width
                3: { cellWidth: 20 }, // Column 4 (Expense Date) - medium width
                4: { cellWidth: 20 }, // Column 5 (File) - wide width for the link column
                5: { cellWidth: 20 }, // Column 5 (File) - wide width for the link column
                6: { cellWidth: 20 }, // Column 5 (File) - wide width for the link column
                7: { cellWidth: 40 }, // Column 5 (File) - wide width for the link column
                8: { cellWidth: 20 }, // Column 5 (File) - wide width for the link column
            },
            didDrawCell: (data: any) => {
                console.log('✌️data --->', data.column);
                if (data.column.index === 7) {
                    const fileUrl = data.cell.raw; // The file URL that should be clickable

                    if (fileUrl) {
                        doc.setTextColor(0, 0, 255);
                        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: fileUrl });
                    }
                }
            },
        });

        // Save PDF with a name
        doc.save('Invoice_Report.pdf');
    };

    // Function to handle PDF download
    const handleDownloadPDF = (record: any) => {
        const doc = new jsPDF();

        // Example: If you want to render HTML content to a PDF (optional, if you have an HTML structure)
        // You can get an HTML element (e.g., invoice) and use html2canvas to convert it to an image
        // This can be useful if you want to capture an HTML view of the invoice

        const invoiceElement = document.getElementById('invoice-content'); // This could be your invoice HTML container
        if (invoiceElement) {
            html2canvas(invoiceElement).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                doc.addImage(imgData, 'PNG', 10, 10, 180, 160); // Add image to the PDF (adjust coordinates and size)
                doc.save(`invoice-${record.id}.pdf`); // Save the generated PDF
            });
        } else {
            // If you don't need HTML content, just generate a simple PDF with data
            doc.text(`Invoice ID: ${record.id}`, 10, 10);
            doc.text(`Invoice Number: ${record.quotation_number}`, 10, 20);
            doc.text(`Total Amount: ${record.total_amount}`, 10, 30);
            doc.save(`invoice-${record.id}.pdf`);
        }
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
                            {/* <Space> */}
                            <Form.Item label="Invoice No" name="invoice_no" style={{ width: '200px' }}>
                                <Input style={{ width: '100%' }} />
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
                            <Form.Item label="From Date" name="start_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="end_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            {/* </Space> */}

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
                    <Table
                        dataSource={dataSource}
                        columns={columns}
                        pagination={false}
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

export default InvoiceReport;
