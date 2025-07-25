import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, DatePicker, Select, Tooltip, Spin, Space, Modal } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, capitalizeFLetter, ObjIsEmpty, roundNumber, useSetState } from '@/utils/function.util';
import { saveAs } from 'file-saver';
import { message } from 'antd';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';
import { scrollConfig } from '@/utils/constant';

const SaleReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [saleFormData, setSaleFormData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        invoiceList: [],
        discount: 0,
        searchValue: null,
        btnloading:false
    });

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

    useEffect(() => {
        initialData(1);
    }, []);

    const initialData = async (page: any) => {
        try {
            setState({ loading: true });

            const res: any = await Models.invoice.invoiceList(page);
            setState({
                invoiceList: res?.results,
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

    const bodyData = () => {
        const body: any = {};
        if (state.searchValue) {
            if (state.searchValue?.customer) {
                body.customer = state.searchValue.customer;
            }
            if (state.searchValue?.from_date) {
                body.from_date = state.searchValue.from_date;
            }

            if (state.searchValue?.project_name) {
                body.project_name = state.searchValue.project_name;
            }
            if (state.searchValue?.to_date) {
                body.to_date = state.searchValue.to_date;
            }
        }

        return body;
    };

    // Table Datas
    const columns = [
        {
            title: (
                <Tooltip title="Date">
                    <span>Date</span>
                </Tooltip>
            ),
            title1: 'Date',
            dataIndex: 'date',
            key: 'date',
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
        },
        {
            title: (
                <Tooltip title="Customer Name">
                    <span>Customer Name</span>
                </Tooltip>
            ),
            title1: 'Customer Name',
            // dataIndex: 'customer_name',
            key: 'customer_name',
            className: 'singleLineCell ',
            render: (record: any) => {
                return <div>{record.customer.customer_name}</div>;
            },
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
            // dataIndex: 'customer_gst_no',
            key: 'customer_gst_no',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.customer.gstin_no}</div>;
            },
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
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
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
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },

        // {
        //     title: (
        //         <Tooltip title="Cheque No">
        //             <span>Cheque No</span>
        //         </Tooltip>
        //     ),

        //     title1: 'Cheque No',
        //     dataIndex: 'cheque_number',
        //     key: 'cheque_number',
        //     className: 'singleLineCell',
        //     width: 120,
        //     render: (text: any, record: any) => (text ? text : ''),
        // },

        // {
        //     title: (
        //         <Tooltip title="UPI">
        //             <span>UPI</span>
        //         </Tooltip>
        //     ),

        //     title1: 'UPI',
        //     dataIndex: 'upi',
        //     key: 'upi',
        //     className: 'singleLineCell',
        //     width: 100,
        //     render: (text: any, record: any) => (text ? text : ''),
        // },
        // {
        //     title: (
        //         <Tooltip title="Neft">
        //             <span>Neft</span>
        //         </Tooltip>
        //     ),

        //     title1: 'Neft',
        //     dataIndex: 'bank',
        //     key: 'bank',
        //     className: 'singleLineCell',
        //     width: 100,
        //     render: (text: any, record: any) => (text ? text : ''),
        // },

        // {
        //     title: (
        //         <Tooltip title="TDS">
        //             <span>TDS</span>
        //         </Tooltip>
        //     ),

        //     title1: 'Tds',
        //     dataIndex: 'tds_amount',
        //     key: 'tds_amount',
        //     className: 'singleLineCell',
        //     width: 100,
        //     render: (text: any, record: any) => (text ? roundNumber(text) : ''),
        // },

        {
            title: (
                <Tooltip title="Payment Info">
                    <span>Payment Info</span>
                </Tooltip>
            ),
            title1: 'Payment Method',
            key: 'payment_method',
            className: 'singleLineCell',
            width: 150,
            render: (record: any) => <div>{record?.invoice_receipt?.payment_mode ? capitalizeFLetter(record?.invoice_receipt?.payment_mode) : ''}</div>,
        },

        {
            title: (
                <Tooltip title="Last Payment">
                    <span>Payment Info</span>
                </Tooltip>
            ),
            title1: 'Last Payment',
            key: 'last_payment',
            className: 'singleLineCell',
            width: 150,
            render: (record: any) => <div>{record?.invoice_receipt?.amount ? roundNumber(record?.invoice_receipt?.amount) : ''}</div>,
        },

        // {
        //     title: (
        //         <Tooltip title="CGST Tax">
        //             <span>CGST Tax</span>
        //         </Tooltip>
        //     ),

        //     title1: 'CGST Tax',
        //     // dataIndex: 'cgst_tax',
        //     key: 'cgst_tax',
        //     className: 'singleLineCell',
        //     width: 100,
        //     // render: (record: any) => {
        //     //     return <div>{roundNumber(record)}</div>;
        //     // },
        //     render: (record: any) => {
        //         const cgstTax = record.tax.find((item: any) => item.tax_name === 'CGST');
        //         return <div>{cgstTax ? `${roundNumber(cgstTax.tax_percentage)}%` : '-'}</div>;
        //     },
        // },

        // {
        //     title: (
        //         <Tooltip title="SGST Tax">
        //             <span>SGST Tax</span>
        //         </Tooltip>
        //     ),
        //     title1: 'SGST Tax',
        //     // dataIndex: 'sgst_tax',
        //     key: 'sgst_tax',
        //     className: 'singleLineCell',
        //     width: 100,
        //     render: (record: any) => {
        //         const sgstTax = record.tax.find((item: any) => item.tax_name === 'SGST');
        //         return <div>{sgstTax ? `${roundNumber(sgstTax.tax_percentage)}%` : '-'}</div>;
        //     },
        // },

        // {
        //     title: (
        //         <Tooltip title="IGST Tax">
        //             <span>IGST Tax</span>
        //         </Tooltip>
        //     ),
        //     title1: 'IGST Tax',
        //     // dataIndex: 'igst_tax',
        //     key: 'igst_tax',
        //     className: 'singleLineCell',
        //     width: 100,
        //     render: (record: any) => {
        //         const igstTax = record.tax.find((item: any) => item.tax_name === 'IGST');
        //         return <div>{igstTax ? `${roundNumber(igstTax.tax_percentage)}%` : '-'}</div>;
        //     },
        // },
        {
            title: (
                <Tooltip title="Invoice File">
                    <span>Invoice File</span>
                </Tooltip>
            ),
            title1: 'Invoice File',

            // dataIndex: 'invoice_file',
            key: 'invoice_file',
            className: 'singleLineCell',
            width: 150,
            render: (text: any, record: any) => {
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
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },
    ];

    // form submit
    const onFinish = async (values: any, page = 1) => {
        try {
            setState({ loading: true });

            const body = {
                project_name: values.project_name ? values.project_name : '',
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                customer: values.customer ? values.customer : '',
            };

            const res: any = await Models.invoice.filter(body, page);
            setState({
                invoiceList: res?.results,
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

    const onFinishFailed = (errorInfo: any) => {};

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

    type FieldType = {
        project_name?: string;
        from_date?: string;
        to_date?: string;
        customer?: string;
    };

    // export to excel format
    const exportToExcel = async () => {
        setState({ btnloading: true });
        const body = {
            project_name: state.searchValue?.project_name ? state.searchValue?.project_name : '',
            from_date: state.searchValue?.from_date ? dayjs(state.searchValue?.from_date).format('YYYY-MM-DD') : '',
            to_date: state.searchValue?.to_date ? dayjs(state.searchValue?.to_date).format('YYYY-MM-DD') : '',
            customer: state.searchValue?.customer ? state.searchValue?.customer : '',
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;
        try {
            while (hasNext) {
                let res: any;

                if (!ObjIsEmpty(bodyData())) {
                    res = await Models.invoice.filter(body, currentPage);
                } else {
                    res = await Models.invoice.invoiceList(currentPage);
                }

                allData = allData.concat(res?.results || []);

                hasNext = !!res?.next;
                if (hasNext) currentPage += 1;
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Add header row
            worksheet.addRow(columns.map((column) => column.title1));
            allData.forEach((row: any) => {
                const rowData = columns.map((column: any) => {
                    const key = column.key;

                    if (column.dataIndex) {
                        return row[column.dataIndex] ?? '';
                    }

                    if (key === 'customer_name') {
                        return row.customer?.customer_name || '';
                    }
                    if (key === 'customer_gst_no') {
                        return row.customer?.gstin_no || '';
                    }

                    if (key === 'advance' || key === 'balance' || key === 'total_amount') {
                        return roundNumber(row[key]);
                    }

                    if (key === 'invoice_file') {
                        return row.invoice_image ? 'Download' : 'No File';
                    }

                    if (key === 'cgst_tax') {
                        const cgst = row.tax?.find((item: any) => item.tax_name === 'CGST');
                        return cgst ? `${cgst.tax_percentage}%` : '-';
                    }

                    if (key === 'sgst_tax') {
                        const sgst = row.tax?.find((item: any) => item.tax_name === 'SGST');
                        return sgst ? `${sgst.tax_percentage}%` : '-';
                    }

                    if (key === 'igst_tax') {
                        const igst = row.tax?.find((item: any) => item.tax_name === 'IGST');
                        return igst ? `${igst.tax_percentage}%` : '-';
                    }

                    if (key === 'cheque_number' || key === 'upi' || key === 'bank' || key === 'tds_amount') {
                        return row[key] || '';
                    }

                    return ''; // fallback
                });

                worksheet.addRow(rowData);
            });

            const blob = await workbook.xlsx.writeBuffer();

            // Use file-saver to save the Blob as a file
            FileSaver.saveAs(
                new Blob([blob], {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                }),
                'Sales-Report.xlsx'
            );
        } catch (error) {
            console.error('❌ Error exporting Excel:', error);
        } finally {
            setState({ btnloading: false });
        }

        // Add data rows

        // Generate a Blob containing the Excel file
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
        // form.resetFields();
    };

    const onFinishZip = (values: any) => {

        setState({zipBtnloading:true})

        // Get the selected month and year from the DatePicker value
        const selectedDate = values.month; // The value from the DatePicker
        const year = selectedDate?.year(); // Get the year from the selected date
        const month = selectedDate?.month() + 1; // Get the month (1-based, so add 1)

        // Construct the body object with the selected year and month
        const body = {
            year: year,
            month: month,
        };


        const Token = localStorage.getItem('token');
        if (!Token) {
            console.error('No token found');
            return;
        }

        axios
            .get(`${baseUrl}/invoice-reports/zip/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
                params: { ...body },
                responseType: 'blob', // Send the year and month as query parameters
            })
            .then((res: any) => {
                messageApi.open({
                    type: 'success',
                    content: 'Invoice report generated successfully.',
                });
                setIsModalOpen(false);
                const blob = new Blob([res.data], { type: 'application/zip' });
                saveAs(blob, `Invoice Report ${year}-${month}.zip`);
            })
            .catch((error: any) => {
                console.log('✌️error --->', error);
                if (error.response?.status === 401) {
                    router.push('/');
                } else if (error.response?.status === 404) {
                    messageApi.open({
                        type: 'error',
                        content: 'No invoice found for the selected month and year.',
                    });
                } else {
                    console.error('Error fetching invoices:', error);
                }
            })
            .finally(() => {
                // form.resetFields(); // Reset the form after completion
                setState({zipBtnloading:false})
            });
    };

    const onFinishFailedZip = (errorInfo: any) => {
    };

    return (
        <>
            <div className="panel">
                {contextHolder}
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Sales Report</h1>
                    </div>
                    <div>
                        <Space>
                            <Button type="primary" onClick={showModal}>
                                Export Zip File
                            </Button>
                            <button type="button" onClick={exportToExcel} className="create-button">
                                {state.btnloading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2" /> : 'Export to Excel'}
                            </button>
                        </Space>
                    </div>
                </div>

                <div className="table-responsive">
                    <Table
                        dataSource={state.invoiceList}
                        columns={columns}
                        scroll={scrollConfig}
                        pagination={false}
                        loading={{
                            spinning: state.loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>

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
                            {/* <Pagination activeNumber={handlePageChange} totalPages={state.total} currentPages={state.currentPage} /> */}
                        </div>
                    </div>
                )}
            </div>

            <Modal title="Export Zip File" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
                <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinishZip} onFinishFailed={onFinishFailedZip} autoComplete="off">
                    <Form.Item label="Year & Month" name="month" required={true} rules={[{ required: true, message: 'Year & Month field is required.' }]}>
                        <DatePicker picker="month" className="w-full" />
                    </Form.Item>

                    <Form.Item>
                        <div className="form-btn-main">
                            <Space>
                                <Button danger htmlType="submit" onClick={() => handleCancel()}>
                                    Cancel
                                </Button>
                                <Button type="primary" htmlType="submit">
                                    {state.zipBtnloading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2" /> : 'Submit'}
                                    
                                </Button>
                            </Space>
                        </div>
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SaleReport;
