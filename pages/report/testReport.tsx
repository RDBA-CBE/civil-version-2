import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, DatePicker, Select, Spin } from 'antd';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, commomDateFormat, Dropdown, ObjIsEmpty, roundNumber, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';
import CustomSelect from '@/components/Select';
import moment from 'moment';
import { scrollConfig } from '@/utils/constant';

const TestReport = () => {
    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState([]);
    const [saleFormData, setSaleFormData] = useState<any>([]);
    const [loading, setLoading] = useState(false);
    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        testList: [],
        search: '',
        btnLoading: false,
        customerList: [],
        customerHasNext: null,
        customerCurrentPage: null,
        testHasNext: null,
        testCurrentPage: 1,
        filterTestList: [],

        materialHasNext: null,
        materialCurrentPage: 1,
        materialList: [],
    });

    useEffect(() => {
        customersList();
        testList();
        initialData(1);
        materialList();
    }, []);

    const initialData = async (page: any) => {
        try {
            setState({ loading: true });

            const res: any = await Models.testReport.testReportList(page);
            setState({
                testList: res?.results,
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

    const testList = async (page = 1) => {
        try {
            const res: any = await Models.test.testList(page, null);
            const dropdown = Dropdown(res?.results, 'test_name');
            setState({ filterTestList: dropdown, testHasNext: res?.next, testCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const testSearch = async (text: any) => {
        try {
            const res: any = await Models.test.testList(1, text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'test_name');
                setState({ filterTestList: dropdown, testHasNext: res?.next, testCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const testLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.test.testList(page, null);
            const dropdown = Dropdown(res?.results, 'test_name');
            setState({ filterTestList: [...state.filterTestList, ...dropdown], testHasNext: res?.next, testCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const materialList = async (page = 1) => {
        try {
            const res: any = await Models.material.materialList(page, null);
            const dropdown = Dropdown(res?.results, 'material_name');
            setState({ materialList: dropdown, materialHasNext: res?.next, materialCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const materialSearch = async (text: any) => {
        try {
            const res: any = await Models.material.materialList(1, null);

            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'material_name');
                setState({ materialList: dropdown, materialHasNext: res?.next, materialCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const materialLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.material.materialList(page, null);
            const dropdown = Dropdown(res?.results, 'material_name');
            setState({ materialList: [...state.materialList, ...dropdown], materialHasNext: res?.next, materialCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

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
            render: (text: any, record: any) => (
                <a href={`/invoice/edits?id=${record.invoice}`} rel="noopener noreferrer">
                    {record.invoice_no}
                </a>
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
            render: (record: any) => {
                return <div>{record ? commomDateFormat(record) : ''}</div>;
            },
        },
    ];

    const bodyData = () => {
        const body: any = {};

        if (state.searchValue) {
            if (state.searchValue?.customer) {
                body.customer = state.searchValue.customer;
            }
            if (state.searchValue?.material) {
                body.material = state.searchValue.material;
            }
            if (state.searchValue?.from_date) {
                body.from_date = state.searchValue.from_date;
            }

            if (state.searchValue?.to_date) {
                body.to_date = state.searchValue.to_date;
            }
            if (state.searchValue?.test) {
                body.test = state.searchValue.test;
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
                test: values.test ? values.test?.value : '',
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                customer: values.customer ? values.customer?.value : '',
                material: values.material ? values.material?.value : '',
                invoice_no: values.invoice_no ? values.invoice_no : '',
            };

            const res: any = await Models.testReport.filter(body, page);
            setState({
                testList: res?.results,
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

    type FieldType = {
        project_name?: string;
        from_date?: string;
        to_date?: string;
        customer?: string;
    };

    // export to excel format
    const exportToExcel = async () => {
        setState({ btnLoading: true });

        const body = {
            test: state.searchValue?.test ? state.searchValue.test?.value : '',
            from_date: state.searchValue?.from_date ? dayjs(state.searchValue?.from_date).format('YYYY-MM-DD') : '',
            to_date: state.searchValue?.to_date ? dayjs(state.searchValue?.to_date).format('YYYY-MM-DD') : '',
            customer: state.searchValue?.customer ? state.searchValue.customer?.value : '',
            material: state.searchValue?.material ? state.searchValue.material?.value : '',
            invoice_no: state.searchValue?.invoice_no ? state.searchValue?.invoice_no : '',
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        try {
            while (hasNext) {
                let res: any;

                if (!ObjIsEmpty(bodyData())) {
                    res = await Models.testReport.filter(body, currentPage);
                } else {
                    res = await Models.testReport.testReportList(currentPage);
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
          allData.forEach((row: any) => {
                const rowData = columns.map((column: any) => {
                    // Handle date formatting
                    if (column.key === 'created_date') {
                        return commomDateFormat(row.created_date) ;
                    }
                    
                    // Handle special cases
                    if (column.key === 'customer_name') {
                        return row.customer?.customer_name || '';
                    }
                    
                    // Handle numeric formatting
                    if (column.key === 'advance' || column.key === 'after_tax_amount' || column.key === 'balance') {
                        return roundNumber(row[column.key]);
                    }
                    
                    // Default case - use dataIndex
                    return row[column.dataIndex] || '';
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
                'Test-Report.xlsx'
            );
            setState({ btnLoading: false });
        } catch (error) {
            setState({ btnLoading: false });

            console.error('❌ Error exporting Excel:', error);
        } finally {
            setState({ btnLoading: false });
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

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <div className="sale_report_inputs gap-4">
                            <Form.Item label="Invoice No" name="invoice_no" style={{ width: '250px' }}>
                                <Input
                                    placeholder="Enter Invoice No"
                                    style={{
                                        height: '38px',
                                    }}
                                    onChange={(e) => {
                                        form.setFieldsValue({ invoice_no: e.target.value });
                                    }}
                                />
                            </Form.Item>
                            <Form.Item label="Test" name="test" style={{ width: '250px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => testSearch(data)}
                                    value={state.test}
                                    options={state.filterTestList}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        form.setFieldsValue({ test: selectedOption });
                                        testList(1);
                                    }}
                                    loadMore={() => {
                                        if (state.testHasNext) {
                                            testLoadMore(state.testCurrentPage + 1);
                                        }
                                    }}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
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

                            <Form.Item label="Material" name="material" style={{ width: '250px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => materialSearch(data)}
                                    value={state.material}
                                    options={state.materialList}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        form.setFieldsValue({ material: selectedOption });
                                        materialList(1);
                                    }}
                                    loadMore={() => {
                                        if (state.materialHasNext) {
                                            materialLoadMore(state.materialCurrentPage + 1);
                                        }
                                    }}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Test Report</h1>
                    </div>
                    <div>
                        <button type="button" onClick={exportToExcel} className="create-button">
                            {state.btnLoading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2" /> : 'Export to Excel'}
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <Table
                        dataSource={state.testList}
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

                {state.testList?.length > 0 && (
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

export default TestReport;
