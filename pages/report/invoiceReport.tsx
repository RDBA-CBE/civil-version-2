import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Form, Select, DatePicker, Spin, InputNumber, Tooltip, Modal } from 'antd';
import { Input } from 'antd';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import { baseUrl, ObjIsEmpty, roundNumber, useSetState, Dropdown, commomDateFormat } from '@/utils/function.util';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';
import moment from 'moment';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';

const InvoiceReport = () => {
    const [form] = Form.useForm();

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        invoiceReportList: [],
        search: '',
        btnLoading: false,
        customerList: [],
        customerHasNext: null,
        customerCurrentPage: null,
    });

    // get GetExpenseReport datas
    useEffect(() => {
        initialData();
        customersList();
    }, []);

    const initialData = async (page = 1) => {
        try {
            setState({
                loading: true,
            });

            const res: any = await Models.invoiceReport.invoiceReportList(page);
            setState({
                invoiceReportList: res?.results,
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

    const bodyData = () => {
        const body: any = {};
        if (state.searchValue) {
            if (state.searchValue?.customer) {
                body.customer = state.searchValue.customer;
            }
            if (state.searchValue?.start_date) {
                body.from_date = state.searchValue.start_date;
            }

            if (state.searchValue?.project_name) {
                body.project_name = state.searchValue.project_name;
            }
            if (state.searchValue?.end_date) {
                body.to_date = state.searchValue.end_date;
            }
            if (state.searchValue?.invoice_no) {
                body.invoice_no = state.searchValue.invoice_no;
            }
        }

        return body;
    };

    // form submit
    const onFinish = async (values: any, page = 1) => {
        try {
            setState({ loading: true });
            const body = {
                from_date: values?.start_date ? dayjs(values?.start_date).format('YYYY-MM-DD') : '',
                to_date: values?.end_date ? dayjs(values?.end_date).format('YYYY-MM-DD') : '',
                invoice_no: values?.invoice_no ? values?.invoice_no : '',
                project_name: values?.project_name ? values?.project_name : '',
                customer: values?.customer ? values?.customer?.value : '',
            };

            const res: any = await Models.invoiceReport.filter(body, page);

            setState({
                invoiceReportList: res?.results,
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

    // Table Headers
    const columns = [
        {
            title: 'Invoice No',
            // dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.invoice.invoice_no}</div>;
            },
        },
        {
            title: 'Customer',
            // dataIndex: 'customer',
            key: 'customer',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.invoice.customer}</div>;
            },
        },
        {
            title: 'Project Name',
            // dataIndex: 'project_name',
            key: 'project_name',
            className: 'singleLineCell',
            width: 150,
            render: (record: any) => {
                return <div>{record.invoice.project_name}</div>;
            },
        },
        {
            title: 'Advance',
            // dataIndex: 'advance',
            key: 'advance',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record.invoice.advance)}</div>;
            },
        },

        {
            title: 'Total Amount',
            // dataIndex: 'total_amount',
            key: 'after_tax_amount',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record.invoice.after_tax_amount)}</div>;
            },
        },
        {
            title: 'Balance',
            // dataIndex: 'balance',
            key: 'balance',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record.invoice.balance)}</div>;
            },
        },
        {
            title: 'Invoice Date',
            // dataIndex: 'date',
            key: 'date',
            className: 'singleLineCell',
            width: 150,
            render: (record: any) => {
                return <div>{record?.invoice?.date ? commomDateFormat(record?.invoice?.date) : ''}</div>;
            },
        },
        {
            title: 'File',
            dataIndex: 'invoice_file',
            key: 'invoice_file',
            className: 'singleLineCell',
            width: 150,
            render: (text: any, record: any) => {
                return (
                    <>
                        {record?.invoice?.invoice_file ? (
                            <a href={record.invoice.invoice_file} target="_blank" rel="noopener noreferrer">
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
            title: 'Completed',
            // dataIndex: 'completed',
            key: 'completed',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.invoice.completed}</div>;
            },
        },
    ];

    // export to excel format

    const exportToExcel = async (values: any) => {
        setState({ btn1loading: true });

        const selectedDate = values.month;
        const year = selectedDate?.year();

        // Construct the body object with the selected year and month

        const fromDate = dayjs(`${year}-04-01`).format('YYYY-MM-DD');
        const toDate = dayjs(`${year + 1}-03-31`).format('YYYY-MM-DD');

        const body = {
            from_date: fromDate,
            to_date: toDate,
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        while (hasNext) {
            let res: any;

            res = await Models.invoiceReport.filter(body, currentPage);

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        // const filteredData = allData.filter((item: any) => {
        //     if (!item.date) return false;
        //     const itemDate = dayjs(item.date);
        //     return itemDate.isAfter(fromDate.subtract(1, 'day')) && itemDate.isBefore(toDate.add(1, 'day'));
        // });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        // Header row
        worksheet.addRow(['Invoice No', 'Customer', 'Project Name', 'Advance', 'Total Amount', 'Balance', 'Date', 'File', 'Completed']);

        // Data rows
        allData.forEach((row: any) => {
            worksheet.addRow([
                row.invoice.invoice_no,
                row.invoice.customer,
                row.invoice.project_name,
                roundNumber(row.invoice.advance),
                roundNumber(row.invoice.after_tax_amount),
                roundNumber(row.invoice.balance),
                commomDateFormat(row.invoice.date),
                {
                    text: 'Download',
                    hyperlink: row.invoice.invoice_file,
                },
                row.invoice.completed,
            ]);
        });

        // Generate a Blob containing the Excel file
        const blob = await workbook.xlsx.writeBuffer();

        // Use file-saver to save the Blob as a file
        FileSaver.saveAs(
            new Blob([blob], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            `Invoice-Report-${year}.xlsx`
        );

        setState({ btn1loading: false });
        setIsModalOpen(false);
    };

    // const exportToExcel = async (values: any) => {
    //     setState({ loading: true });

    //     const selectedDate = values.month;
    //     const year = selectedDate?.year();

    //     const fromDate = dayjs(`${year}-04-01`);
    //     const toDate = dayjs(`${year + 1}-03-31`);

    //     // Filter body for API

    //       const body = {
    //                 from_date: state.searchValue?.start_date ? dayjs(state.searchValue?.start_date).format('YYYY-MM-DD') : '',
    //                 to_date: state.searchValue?.end_date ? dayjs(state.searchValue?.end_date).format('YYYY-MM-DD') : '',
    //                 invoice_no: state.searchValue?.invoice_no ? state.searchValue?.invoice_no : '',
    //                 project_name: state.searchValue?.project_name ? state.searchValue?.project_name : '',
    //                 customer: state.searchValue?.customer ? state.searchValue?.customer : '',
    //             };

    //     let allData: any[] = [];
    //     let currentPage = 1;
    //     let hasNext = true;

    //     try {
    //         while (hasNext) {
    //             let res: any;
    //             if (!ObjIsEmpty(bodyData())) {
    //                 res = await Models.invoiceReport.filter(body, currentPage);
    //             } else {
    //                 res = await Models.invoiceReport.invoiceReportList(currentPage);

    //             }

    //             allData = allData.concat(res?.results || []);

    //             if (res?.next) {
    //                 currentPage += 1;
    //             } else {
    //                 hasNext = false;
    //             }
    //         }

    //         // Filter again by FY year range (in case backend didn't use date filter)
    //         const filteredData = allData.filter((item: any) => {
    //             const rawDate = item?.invoice?.date;
    //             if (!rawDate) return false;

    //             const itemDate = dayjs(rawDate);
    //             return (
    //                 itemDate.isAfter(fromDate.subtract(1, 'day')) &&
    //                 itemDate.isBefore(toDate.add(1, 'day'))
    //             );
    //         });

    //         console.log("filteredData",filteredData);

    //         const workbook = new ExcelJS.Workbook();
    //         const worksheet = workbook.addWorksheet('Invoice Report');

    //         // Header row
    //         worksheet.addRow([
    //             'Invoice No',
    //             'Customer',
    //             'Project Name',
    //             'Advance',
    //             'Total Amount',
    //             'Balance',
    //             'Date',
    //             'File',
    //             'Completed',
    //         ]);

    //         // Data rows
    //         filteredData.forEach((row: any) => {
    //             worksheet.addRow([
    //                 row.invoice.invoice_no,
    //                 row.invoice.customer,
    //                 row.invoice.project_name,
    //                 roundNumber(row.invoice.advance),
    //                 roundNumber(row.invoice.total_amount),
    //                 roundNumber(row.invoice.balance),
    //                 row.invoice.date,
    //                 {
    //                     text: 'Download',
    //                     hyperlink: row.invoice.invoice_file,
    //                 },
    //                 row.invoice.completed,
    //             ]);
    //         });

    //         // Save
    //         const blob = await workbook.xlsx.writeBuffer();
    //         FileSaver.saveAs(
    //             new Blob([blob], {
    //                 type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    //             }),
    //             `Invoice-Report-${year}.xlsx`
    //         );
    //     } catch (error) {
    //         console.error('❌ Error exporting Excel:', error);
    //     } finally {
    //         setState({ loading: false });
    //         setIsModalOpen(false)
    //     }
    // };

    const onFinishFailedZip = (errorInfo: any) => {};

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
    const handleDownloadAll = async () => {
        setState({ btnloading: true });
        const { searchValue } = state;

        const body = {
            from_date: searchValue?.start_date ? dayjs(searchValue?.start_date).format('YYYY-MM-DD') : '',
            to_date: searchValue?.end_date ? dayjs(searchValue?.end_date).format('YYYY-MM-DD') : '',
            invoice_no: searchValue?.invoice_no || '',
            project_name: searchValue?.project_name || '',
            customer: searchValue?.customer?.value || '',
        };
        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        // Fetch all paginated data
        while (hasNext) {
            let res: any;

            if (!ObjIsEmpty(bodyData())) {
                res = await Models.invoiceReport.filter(body, currentPage);
            } else {
                res = await Models.invoiceReport.invoiceReportList(currentPage);
            }

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        setState({ btnloading: false });

        const doc: any = new jsPDF();
        doc.text('Invoice Report', 14, 16);

        const headers = ['Invoice No', 'Customer', 'Project Name', 'Advance Amount', 'Total Amount', 'Balance Amount', 'Date', 'File', 'Completed'];

        const tableData = allData.map((item: any) => {
            return [
                item.invoice.invoice_no,
                item.invoice.customer,
                item.invoice.project_name,
                item.invoice.advance,
                item.invoice.total_amount,
                item.invoice.balance,
                commomDateFormat(item.invoice.date),
                item.invoice.invoice_file,
                item.invoice.completed,
            ];
        });

        doc.autoTable({
            head: [headers],
            body: tableData,
            startY: 20,
            margin: { horizontal: 1 },
            theme: 'striped',
            columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 20 },
                2: { cellWidth: 20 },
                3: { cellWidth: 20 },
                4: { cellWidth: 20 },
                5: { cellWidth: 20 },
                6: { cellWidth: 20 },
                7: { cellWidth: 40 },
                8: { cellWidth: 20 },
            },
            didDrawCell: (data: any) => {
                if (data.column.index === 4) {
                    const fileUrl = data.cell.raw;
                    if (fileUrl) {
                        doc.setTextColor(0, 0, 255);
                        doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: fileUrl });
                    }
                }
            },
        });

        doc.save('Invoice_Report.pdf');
    };

    const showModal = () => {
        setIsModalOpen(true);

        // form.resetFields();
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Invoice Report</h1>
                    </div>
                    <div>
                        <Space>
                            <Button
                                type="primary"
                                // onClick={exportToExcel}
                                onClick={showModal}
                            >
                                Export to Excel
                            </Button>

                            <Button type="primary" onClick={handleDownloadAll}>
                                {state.btnloading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2 " /> : 'Download PDF'}
                            </Button>

                            {/* <Search placeholder="input search text" onChange={inputChange} enterButton className='search-bar' /> */}
                        </Space>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.invoiceReportList}
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
                {state.invoiceReportList?.length > 0 && (
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

            <Modal title="Export to Excel" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
                <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={exportToExcel} onFinishFailed={onFinishFailedZip} autoComplete="off">
                    <Form.Item label="Financial Year" name="month" required={true} rules={[{ required: true, message: 'Year & Month field is required.' }]}>
                        <DatePicker picker="year" className="w-full" />
                    </Form.Item>

                    <Form.Item>
                        <div className="form-btn-main">
                            <Space>
                                <Button danger htmlType="submit" onClick={() => handleCancel()}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit" loading={state.btn1loading}>
                                    {state.loading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2 " /> : 'Submit'}
                                </Button>
                            </Space>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default InvoiceReport;
