import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin } from 'antd';
import { Input } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, commomDateFormat, Dropdown, roundNumber, useSetState } from '@/utils/function.util';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Models from '@/imports/models.import';
import CustomSelect from '@/components/Select';
import Pagination from '@/components/pagination/pagination';
import { scrollConfig } from '@/utils/constant';

const InvoiceFileReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [formFields, setFormFields] = useState<any>([]);

    const [state, setState] = useSetState({
        invoiceList: [],
        hasNext: null,
        currentPage: 1,
        loading: false,
        customerCurrentPage: 1,
        customerHasNext: null,
        customerList: [],
    });

    useEffect(() => {
        getData(1);
        customersList()
    }, []);

    const getData = async (page: number) => {
        try {
            setState({ loading: true });
            const body = bodyData();

            const res: any = await Models.expense.invoiceFileReport(page, body);
            setState({
                invoiceList: res?.results || [],
                currentPage: page,
                total: res?.count,
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const customersList = async (page = 1) => {
        try {
            const res: any = await Models.invoice.customerList(page);
            const dropdown = Dropdown(res?.results, 'customer_name');
            setState({ customerList: [...state.customerList, ...dropdown], customerHasNext: res?.next, customerCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const customerSearch = async (text: any) => {
        try {
            const res: any = await Models.invoice.customerSearch(text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'customer_name');
                setState({ customerList: dropdown, customerHasNext: res?.next, customerCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    // Table Headers
    const columns = [
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            width: 150,
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
            title: 'Invoice Amount',
            dataIndex: 'invoice_amount',
            key: 'invoice_amount',
            className: 'singleLineCell',
            width: 150,
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },

        {
            title: 'File',
            dataIndex: 'file_url',
            key: 'file_url',
            className: 'singleLineCell',
            render: (text: any, record: any) => (
                <a href={record.file_url} target="_blank" rel="noopener noreferrer">
                    Download
                </a>
            ),
        },
        {
            title: 'Invoice Date',
            dataIndex: 'invoice_date',
            key: 'invoice_date',
            className: 'singleLineCell',
            render: (text: any, record: any) => <div>{record?.created_date ? commomDateFormat(record?.created_date) : 'N/A'}</div>,
        },
    ];

    // export to excel format
    // const exportToExcel = async () => {
    //     const workbook = new ExcelJS.Workbook();
    //     const worksheet = workbook.addWorksheet('Sheet1');

    //     // Add header row
    //     worksheet.addRow(columns.map((column) => column.title));

    //     // Add data rows

    //     dataSource.forEach((row) => {
    //         const rowData: any = [];
    //         columns.forEach((column) => {
    //             if (column.dataIndex === 'file') {
    //                 // Add hyperlink in the specific column
    //                 rowData.push({
    //                     text: row[column.dataIndex], // Text displayed for the link
    //                     hyperlink: row[column.dataIndex], // URL for the link
    //                 });
    //             } else {
    //                 rowData.push(row[column.dataIndex]);
    //             }
    //         });
    //         worksheet.addRow(rowData);
    //     });

    //     // Generate a Blob containing the Excel file
    //     const blob = await workbook.xlsx.writeBuffer();

    //     // Use file-saver to save the Blob as a file
    //     FileSaver.saveAs(
    //         new Blob([blob], {
    //             type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //         }),
    //         'Invoice-File-Report.xlsx'
    //     );
    // };

    const bodyData = () => {
        let body: any = {};
        if (form.getFieldValue('from_date')) {
            body.from_date = dayjs(form.getFieldValue('from_date')).format('YYYY-MM-DD');
        }
        if (form.getFieldValue('to_date')) {
            body.to_date = dayjs(form.getFieldValue('to_date')).format('YYYY-MM-DD');
        }
        if (form.getFieldValue('customer')) {
            body.customer = form.getFieldValue('customer')?.value;
        }
        if (form.getFieldValue('invoice_no')) {
            body.invoice_no = form.getFieldValue('invoice_no');
        }
        if (form.getFieldValue('project_name')) {
            body.project_name = form.getFieldValue('project_name');
        }
        return body;
    };

    const exportToExcel = async (values: any) => {
        setState({ excelBtnLoading: true });

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        while (hasNext) {
            const body = bodyData();
            const res: any = await Models.expense.invoiceFileReport(currentPage, body);

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        worksheet.addRow(['Invoice No', 'Project Name', 'Customer', 'Invoice Amount', 'Invoice Date', 'File']);

        allData.forEach((item: any) => {
            worksheet.addRow([
                item.invoice_no,
                item.project_name,
                item.customer,
                item.invoice_amount,
                commomDateFormat(item.created_date),
                {
                    text: 'Download',
                    hyperlink: item.file_url,
                },
            ]);
        });

        // Generate a Blob containing the Excel file
        const blob = await workbook.xlsx.writeBuffer();

        // Use file-saver to save the Blob as a file
        FileSaver.saveAs(
            new Blob([blob], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            `Invoice-File-Report.xlsx`
        );

        setState({ excelBtnLoading: false });
    };

    // form submit
    const onFinish = async (values: any) => {
        setState({ loading: true });
        const body = {
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            customer: values.customer ? values.customer?.value : '',
            invoice_no: values.invoice_no ? values.invoice_no : '',
            project_name: values.project_name ? values.project_name : '',
            category_name: 2,
        };

        const res: any = await Models.invoiceFile.filter(body, 1);

        setState({
            invoiceList: res?.results || [],
            currentPage: 1,
            total: res?.count,
            loading: false,
        });
    };

    const onFinishFailed = (errorInfo: any) => {};

    const handleDownloadAll = async () => {
        setState({ pdfLoading: true });
        const { searchValue } = state;
        const body = bodyData();

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        // Fetch all paginated data
        while (hasNext) {
            const res: any = await Models.expense.invoiceFileReport(currentPage, body);

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        setState({ pdfLoading: false });

        const doc: any = new jsPDF();
        doc.text('Invoice File Report', 14, 16);

        const headers = ['Invoice No', 'Project Name', 'Customer', 'Invoice Amount', 'Invoice Date', 'File'];

        const tableData = allData.map((item: any) => {
            return [item.invoice_no, item.project_name, item.customer, item.invoice_amount, commomDateFormat(item.created_date), item.file_url];
        });

        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: 20,
            margin: { horizontal: 1 },
            theme: 'striped',
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 40 },
                2: { cellWidth: 40 },
                3: { cellWidth: 40 },
                4: { cellWidth: 30 },
                5: { cellWidth: 30 },
                6: { cellWidth: 60 },
            },
            didDrawCell: (data: any) => {
                if (data.column.index === 5) {
                    const fileUrl = data.cell.raw;
                    if (fileUrl) {
                        doc.setTextColor(0, 0, 255);
                        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: fileUrl });
                    }
                }
            },
        });

        doc.save('Invoice_File_Report.pdf');
    };

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });

        getData(number);

        return number;
    };

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <div className="sale_report_inputs">
                            <Form.Item label="Invoice No" name="invoice_no" style={{ width: '200px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Project Name" name="project_name" style={{ width: '200px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Customer" name="customer" style={{ width: '250px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => customerSearch(data)}
                                    value={state.customer}
                                    options={state.customerList}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        form.setFieldsValue({ customer: selectedOption });
                                        customersList(1);
                                    }}
                                    loadMore={() => {
                                        if (state.customerHasNext) {
                                            customersList(state.customerCurrentPage + 1);
                                        }
                                    }}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%'}} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%'}} />
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Invoice File Report</h1>
                    </div>
                    <div>
                        <Space>
                            <Button type="primary" onClick={exportToExcel} loading={state.excelBtnLoading}>
                                Export to Excel
                            </Button>
                            <Button type="primary" onClick={handleDownloadAll} loading={state.pdfLoading}>
                                Download PDF
                            </Button>
                            {/* <Search placeholder="input search text" onChange={inputChange} enterButton className='search-bar' /> */}
                        </Space>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.invoiceList}
                        columns={columns}
                        pagination={false}
                        scroll={scrollConfig}
                        loading={{
                            spinning: state.loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                    {state.invoiceList?.length > 0 && (
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

export default InvoiceFileReport;
