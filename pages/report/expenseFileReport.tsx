import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin } from 'antd';
import { Input } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, commomDateFormat, ObjIsEmpty, roundNumber, useSetState } from '@/utils/function.util';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import { scrollConfig } from '@/utils/constant';

const ExpenseFileReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [loading, setLoading] = useState(false);

    const [state, setState] = useSetState({
        expenceList: [],
        hasNext: null,
        currentPage: 1,
    });

    useEffect(() => {
        getData(1);
    }, []);

    const getData = async (page: number) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.expense.expenseFileReport(page, body);
            setState({
                expenceList: res?.results || [],
                currentPage: page,
                total: res?.count,
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });

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
            title: 'Expense Amount',
            dataIndex: 'expence_amount',
            key: 'expence_amount',
            className: 'singleLineCell',
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
            title: 'Expense Date',
            dataIndex: 'created_date',
            key: 'created_date',
            className: 'singleLineCell',
            render: (text: any, record: any) => <div>{record?.created_date ? commomDateFormat(record?.created_date) : 'N/A'}</div>,
        },
    ];

    const exportToExcel = async (values: any) => {
        setState({ excelBtnLoading: true });

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        while (hasNext) {
            const body = bodyData();
            const res: any = await Models.expense.expenseFileReport(currentPage, body);

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        worksheet.addRow(['Expense User', 'Expense Amount', 'Expense Date', 'File']);

        allData.forEach((item: any) => {
            worksheet.addRow([
                item.expense_user,
                item.expence_amount,
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
        try {
            setState({ loading: true });
            const body = {
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            };
            const res: any = await Models.expense.expenseFileReport(1, body);
            setState({
                expenceList: res?.results || [],
                currentPage: 1,
                total: res?.count,
                loading: false,
            });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const bodyData = () => {
        let body: any = {};
        if (form.getFieldValue('from_date')) {
            body.from_date = dayjs(form.getFieldValue('from_date')).format('YYYY-MM-DD');
        }
        if (form.getFieldValue('to_date')) {
            body.to_date = dayjs(form.getFieldValue('to_date')).format('YYYY-MM-DD');
        }
        return body;
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
            let res: any;

            res = await Models.expense.expenseFileReport(currentPage, body);

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        setState({ pdfLoading: false });

        const doc: any = new jsPDF();
        doc.text('Expense File Report', 14, 16);

        const headers = ['Expense User', 'Expense Amount', 'Expense Date', 'File'];

        const tableData = allData.map((item: any) => {
            return [
                item.expense_user, // Expense User
                item.expence_amount, // Expense Amount
                commomDateFormat(item.created_date), // Expense Date (formatted)
                item.file_url,
            ];
        });
        console.log('✌️tableData --->', tableData);

        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: 20,
            margin: { horizontal: 1 },
            theme: 'striped',
            columnStyles: {
                0: { cellWidth: 50 },
                1: { cellWidth: 40 },
                2: { cellWidth: 30 },
                3: { cellWidth: 150 },
            },
            didDrawCell: (data: any) => {
                if (data.column.index === 3) {
                    const fileUrl = data.cell.raw;
                    if (fileUrl) {
                        doc.setTextColor(0, 0, 255);
                        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: fileUrl });
                    }
                }
            },
        });

        doc.save('Expense_File_Report.pdf');
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Expense File Report</h1>
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
                        dataSource={state.expenceList}
                        columns={columns}
                        pagination={false}
                        scroll={scrollConfig}
                        loading={{
                            spinning: state.loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                    {state.expenceList?.length > 0 && (
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
            </div>
        </>
    );
};

export default ExpenseFileReport;
