import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin, InputNumber, Tooltip } from 'antd';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import { baseUrl, ObjIsEmpty, roundNumber, useSetState, Dropdown, commomDateFormat } from '@/utils/function.util';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';

const QuotationReport = () => {
    const [form] = Form.useForm();

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        quotationReportList: [],
        search: '',
        btnLoading: false,
        customerList: [],
        customerHasNext: null,
        customerCurrentPage: null,
    });

    // get GetExpenseReport datas
    useEffect(() => {
        customersList();
        initialData(1);
    }, []);

    

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

    const initialData = async (page = 1) => {
        try {
            setState({
                loading: true,
            });

            const res: any = await Models.quotationReport.quotationReportList(page);
            setState({
                quotationReportList: res?.results,
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

    const customersList = async (page = 1) => {
        try {
            const res: any = await Models.invoice.customerList(page);
            const dropdown = Dropdown(res?.results, 'customer_name');
            setState({ customerList: dropdown, customerHasNext: res?.next, customerCurrentPage: page });
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

    const customersLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.invoice.customerList(page);
            const dropdown = Dropdown(res?.results, 'customer_name');
            setState({ customerList: [...state.customerList, ...dropdown], customerHasNext: res?.next, customerCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    // Table Headers
    const columns = [
        {
            title: 'Quotation No',
            // dataIndex: 'quotation_number',
            key: 'quotation_number',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.quotation.quotation_number}</div>;
            },
        },
        {
            title: 'Customer',
            // dataIndex: 'customer',
            key: 'customer',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.quotation.customer}</div>;
            },
        },
        {
            title: 'File',
            dataIndex: 'quotation_file',
            key: 'quotation_file',
            className: 'singleLineCell',
            width: 150,
            render: (text: any, record: any) => {
                return (
                    <>
                        {record?.quotation_file ? (
                            <a href={record.quotation_file} target="_blank" rel="noopener noreferrer">
                                Download
                            </a>
                        ) : (
                            'No File'
                        )}
                    </>
                );
            },
        },

        {
            title: 'Total Amount',
            // dataIndex: 'total_amount',
            key: 'total_amount',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record.quotation.total_amount)}</div>;
            },
        },
    ];

    const bodyData = () => {
        const body: any = {};
        if (state.searchValue) {
            if (state.searchValue?.customer) {
                body.customer = state.searchValue.customer;
            }
            if (state.searchValue?.start_date) {
                body.from_date = state.searchValue.start_date;
            }

            if (state.searchValue?.end_date) {
                body.to_date = state.searchValue.end_date;
            }
        }

        return body;
    };

    // export to excel format

    const exportToExcel = async (item: any) => {
        setState({ btnloading: true, id: item.id });

        const body = {
            from_date: state.searchValue?.start_date ? dayjs(state.searchValue.start_date).format('YYYY-MM-DD') : '',
            to_date: state.searchValue?.end_date ? dayjs(state.searchValue.end_date).format('YYYY-MM-DD') : '',
            customer: state.searchValue?.customer ? state.searchValue?.customer?.value : '',
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        try {
            while (hasNext) {
                let res: any;

                if (!ObjIsEmpty(bodyData())) {
                    res = await Models.quotationReport.filter(body, currentPage);
                } else {
                    res = await Models.quotationReport.quotationReportList(currentPage);
                }

                allData = allData.concat(res?.results || []);

                hasNext = !!res?.next;
                if (hasNext) currentPage += 1;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Quotation Report');

            // Manual headers based on your column config
            worksheet.addRow(['Quotation No', 'Customer', 'File', 'Total Amount']);

            allData.forEach((row: any) => {
                const quotation = row?.quotation || {};
                const fileUrl = row?.quotation_file;

                worksheet.addRow([quotation.quotation_number || '', quotation.customer || '', fileUrl ? { text: 'Download', hyperlink: fileUrl } : 'No File', roundNumber(quotation.total_amount)]);
            });

            const blob = await workbook.xlsx.writeBuffer();

            FileSaver.saveAs(
                new Blob([blob], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
                'Quotation-Report.xlsx'
            );
        } catch (error) {
            console.error('❌ Error exporting Excel:', error);
        } finally {
            setState({ btnloading: false });
        }
    };

    // form submit
    const onFinish = async (values: any, page = 1) => {
        try {
            setState({ loading: true });
            const body = {
                from_date: values?.start_date ? dayjs(values?.start_date).format('YYYY-MM-DD') : '',
                to_date: values?.end_date ? dayjs(values?.end_date).format('YYYY-MM-DD') : '',
                // invoice_number: values?.invoice_no ? values?.invoice_no : '',
                // project_name: values?.project_name ? values?.project_name : '',
                customer: values?.customer ? values?.customer?.value : '',
            };

            const res: any = await Models.quotationReport.filter(body, page);
            setState({
                quotationReportList: res?.results,
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

    const onFinishFailed = (errorInfo: any) => {};

    // download
    const handleDownloadAll = async (item: any) => {
        setState({ btnloading: true, id: item.id });
        const { searchValue } = state;

        const body = {
            from_date: state.searchValue?.start_date ? dayjs(state.searchValue.start_date).format('YYYY-MM-DD') : '',
            to_date: state.searchValue?.end_date ? dayjs(state.searchValue.end_date).format('YYYY-MM-DD') : '',
            customer: state.searchValue?.customer ? state.searchValue?.customer?.value : '',
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        while (hasNext) {
            let res: any;

            if (!ObjIsEmpty(body)) {
                res = await Models.quotationReport.filter(body, currentPage);
            } else {
                res = await Models.quotationReport.quotationReportList(currentPage);
            }

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        setState({ btnloading: false });

        // Create a new jsPDF instance
        const doc: any = new jsPDF();

        // Adding a title to the PDF
        doc.text('Quotation Report', 14, 16);

        // Define the column headers
        const headers = [
            'Quotation No',
            'Customer',
            'File',
            // 'Project Name',
            // 'Discount',
            // 'Advance Amount',
            // 'Balance Amount',
            'Total Amount',
            // 'Tds Amount',

            // 'Place Of Testing',
            // 'Completed',
            // 'Invoice Tests',
            // 'Date',
        ];

        // Map the data into the table format
        const tableData = allData.map((item: any) => {
            return [
                item.quotation.quotation_number,
                item.quotation.customer, // ID
                // item.project_name, // Expense User
                // item.discount,
                // item.advance,
                // item.balance,
                 item.quotation.quotation_file,
                item.quotation.total_amount,
               
                // item.tds_amount,

                // item.quotation.place_of_testing,
                // item.quotation.completed,
                // commomDateFormat(item.quotation.date), // Expense Date (formatted)
                // {
                //     content: item.file, // URL to the file
                //     link: item.file, // URL should be a clickable link in the PDF
                // }
            ];
        });

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
        doc.save('Quotation-Report.pdf');
    };

    // Function to handle PDF download

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
                            {/* <Form.Item label="Invoice No" name="invoice_no" style={{ width: '200px' }}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item> */}

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
                                            customersLoadMore(state.customerCurrentPage + 1);
                                        }
                                    }}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            {/* <Form.Item label="Project Name" name="project_name" style={{ width: '200px' }}>
                                <Input />
                            </Form.Item> */}
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Quotation Report</h1>
                    </div>
                    <div>
                        <Space>
                            {button.map((item) => {
                                return (
                                    <Button
                                        key={item.id}
                                        type="primary"
                                        onClick={() => {
                                            if (item.id == 1) {
                                                exportToExcel(item);
                                            } else {
                                                handleDownloadAll(item);
                                            }
                                        }}
                                    >
                                        {state.btnloading && item.id == state.id ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2" /> : item.name}
                                    </Button>
                                );
                            })}

                            {/* <Search placeholder="input search text" onChange={inputChange} enterButton className='search-bar' /> */}
                        </Space>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.quotationReportList}
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
                {state.quotationReportList?.length > 0 && (
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

export default QuotationReport;
