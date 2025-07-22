import React, { useState, useEffect } from 'react';
import { Table, Form, Input, Button, DatePicker, Select, Spin } from 'antd';
import axios from 'axios';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, ObjIsEmpty, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import IconLoader from '@/components/Icon/IconLoader';

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
    });

    useEffect(() => {
        axios
            .get(`${baseUrl}/test-list/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setSaleFormData(res.data);
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

    console.log('saleFormData', saleFormData);

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
        }

        return body;
    };

    console.log("bodyData",bodyData());
    

    // form submit
    const onFinish = async (values: any, page = 1) => {
        try {
            setState({ loading: true });
            const body = {
                test: values.test ? values.test : '',
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                customer: values.customer ? values.customer : '',
                material: values.material ? values.material : '',
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
        setState({ loading: true });

        const body = {
            test: state.searchValue.test ? state.searchValue.test : '',
            from_date: state.searchValue?.from_date ? dayjs(state.searchValue?.from_date).format('YYYY-MM-DD') : '',
            to_date: state.searchValue?.to_date ? dayjs(state.searchValue?.to_date).format('YYYY-MM-DD') : '',
            customer: state.searchValue.customer ? state.searchValue.customer : '',
            material: state.searchValue.material ? state.searchValue.material : '',
        };

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        console.log("body", body);
        

        try {
            while (hasNext) {
                let res: any;

                if (!ObjIsEmpty(bodyData())) {
                    console.log(!ObjIsEmpty(bodyData));
                    
                    console.log("filter");
                    
                    res = await Models.testReport.filter(body, currentPage);
                } else {
                    console.log(!ObjIsEmpty(bodyData));
                     console.log("No filter");
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
            worksheet.addRow(columns.map((column: any) => row[column.dataIndex]));
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

        } catch (error) {
            console.error('❌ Error exporting Excel:', error);
        }

        finally {
            setState({ loading: false });
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

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <div className="sale_report_inputs">
                            <Form.Item label="Test" name="test" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.tests?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.test_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Customer" name="customer" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.customers?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.customer_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Material" name="material" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {saleFormData?.materials?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.material_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <div style={{ display: 'flex', alignItems: 'end' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '150px' }}>
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
                            {state.loading ? <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2" /> : 'Export to Excel'}
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
                            className="mb-20 "
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
