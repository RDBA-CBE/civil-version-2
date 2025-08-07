import React, { useState, useEffect } from 'react';
import { DatePicker, Form, InputNumber, Select, Space, Table, Spin, Button, Input } from 'antd';
import * as FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import router from 'next/router';
import dayjs from 'dayjs';
import { baseUrl, ObjIsEmpty, roundNumber, useSetState, Dropdown } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';

const PendingPaymentReport = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [dataSource, setDataSource] = useState([]);
    const [formFields, setFormFields] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        paymentPendingList: [],
        searchValue: null,
        btnloading: false,
        customerList: [],
        customerHasNext: null,
        customerCurrentPage: null,
    });

    useEffect(() => {
        initialData(1);
        customersList();
    }, []);

    const initialData = async (page: any) => {
        try {
            setState({ loading: true });

            const res: any = await Models.paymentPending.paymentPendingList(page);
            setState({
                paymentPendingList: res?.results,
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
            if (state.searchValue?.from_date) {
                body.from_date = state.searchValue.from_date;
            }

            if (state.searchValue?.project_name) {
                body.project_name = state.searchValue.project_name;
            }
            if (state.searchValue?.to_date) {
                body.to_date = state.searchValue.to_date;
            }
            if (state.searchValue?.invoice_no) {
                body.invoice_no = state.searchValue.invoice_no;
            }
        }

        return body;
    };

    // Table Datas
    const columns = [
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            width: 100,
            render: (text: any, record: any) => (
                <span style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }} onClick={() => handleRowClick(record)}>
                    {text}
                </span>
            ),
        },
        {
            title: 'Customer Name',
            // dataIndex: 'customer',
            key: 'customer_name',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.customer.customer_name}</div>;
            },
        },
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            className: 'singleLineCell',
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
            title: 'Advance',
            dataIndex: 'advance',
            key: 'advance',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },
        {
            title: 'Total Amount',
            dataIndex: 'after_tax_amount',
            key: 'after_tax_amount',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },
    ];

    const handleRowClick = (record: any) => {
        window.location.href = `/invoice/edits?id=${record.id}`;
    };

    // input search
    // const inputChange = (e: any) => {
    //     const SearchValue = e.target.value;

    //     const filteredData = dataSource.filter((item: any) => {
    //         return (
    //             item.invoice_no.includes(SearchValue) ||
    //             item.customer.toLowerCase().includes(SearchValue.toLowerCase()) ||
    //             item.project_name.toLowerCase().includes(SearchValue.toLowerCase()) ||
    //             item.total_amount.includes(SearchValue) ||
    //             item.advance.includes(SearchValue) ||
    //             item.balance.includes(SearchValue) ||
    //             item.incompleted_test.includes(SearchValue)
    //         );
    //     });
    //     setFilterData(filteredData);
    // };

    // export to excel format
    const exportToExcel = async () => {
        setState({ btnloading: true });

        const body = {
            project_name: state.searchValue?.project_name ? state.searchValue?.project_name : '',
            from_date: state.searchValue?.from_date ? dayjs(state.searchValue?.from_date).format('YYYY-MM-DD') : '',
            to_date: state.searchValue?.to_date ? dayjs(state.searchValue?.to_date).format('YYYY-MM-DD') : '',
            customer: state.searchValue?.customer ? state.searchValue?.customer?.value : '',
            invoice_no: state.searchValue?.invoice_no ? state.searchValue?.invoice_no : '',
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        try {
            while (hasNext) {
                let res: any;

                if (!ObjIsEmpty(bodyData())) {
                    res = await Models.paymentPending.filter(body, currentPage);
                } else {
                    res = await Models.paymentPending.paymentPendingList(currentPage);
                }

                allData = allData.concat(res?.results || []);

                hasNext = !!res?.next;
                if (hasNext) currentPage += 1;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet1');

            // Add header row
            worksheet.addRow(columns.map((column) => column.title));

            // Add data rows
            // dataSource.forEach((row: any) => {
            //     worksheet.addRow(columns.map((column: any) => row[column.dataIndex]));
            // });

            allData.forEach((row: any) => {
                const rowData = columns.map((column: any) => {
                    if (column.key == 'advance' || column.key == 'after_tax_amount' || column.key == 'balance') {
                        return roundNumber(row[column.key]);
                    }

                    if (column.key === 'invoice_file') {
                        if (row.invoice_file) {
                            return {
                                text: 'Download',
                                hyperlink: row.invoice_file,
                                tooltip: 'Click to download invoice file',
                            };
                        }
                        return 'No File';
                    }
                    if (column.dataIndex) {
                        return row[column.dataIndex];
                    } else if (column.key === 'customer_name') {
                        return row.customer?.customer_name || '';
                    } else if (column.key === 'invoice_file') {
                        return row.invoice_file;
                    } else if (column.key == 'advance' || column.key == 'after_tax_amount' || column.key == 'balance') {
                        return roundNumber(row);
                    } else {
                        return ''; // fallback
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
                'Pending-payment-Report.xlsx'
            );
        } catch (error) {
            console.error('❌ Error exporting Excel:', error);
            setState({ btnloading: false });

        } finally {
            setState({ btnloading: false });
        }
    };

    // search

    // form submit
    const onFinish2 = async (values: any, page = 1) => {
        try {
            setState({ loading: true });

            const body = {
                project_name: values.project_name ? values.project_name : '',
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                customer: values.customer ? values.customer?.value : '',
                invoice_no: values.invoice_no ? values.invoice_no : '',
            };

            const res: any = await Models.paymentPending.filter(body, page);
            setState({
                paymentPendingList: res?.results,
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
            onFinish2(state.searchValue, number);
        } else {
            initialData(number);
        }

        return number;
    };

    const onFinishFailed2 = (errorInfo: any) => {};

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish2} onFinishFailed={onFinishFailed2} autoComplete="off">
                        <div className="sale_report_inputs">
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

                            <Form.Item label="From Date" name="from_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Pending Payment Report</h1>
                    </div>
                    <div>
                        <Space>
                            <Button type="primary" onClick={exportToExcel}>
                                {state.btnloading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2" /> : 'Export to Excel'}
                            </Button>
                            {/* <Search placeholder="input search text" onChange={inputChange} enterButton className="search-bar" /> */}
                        </Space>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.paymentPendingList}
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

                {state.paymentPendingList?.length > 0 && (
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

export default PendingPaymentReport;
