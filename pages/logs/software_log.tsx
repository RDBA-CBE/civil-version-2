import React, { useState, useEffect, useRef } from 'react';
import { Button, DatePicker, Form, Input, Modal, Space, Table, message } from 'antd';
import Models from '@/imports/models.import';
import moment from 'moment';
import CommonLoader from '@/components/commonLoader';
import { capitalizeFLetter, roundNumber, useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import { cityData, customerData, discountData, employeeData, expenseCatData, invoiceDisData, invoicePaymentData, invoiceTestData, scrollConfig, testData } from '@/utils/constant';
import CustomSelect from '@/components/Select';
import { BellOutlined, EditOutlined, EyeOutlined, InfoCircleFilled, InfoCircleOutlined, MenuFoldOutlined, NotificationOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import IconBell from '@/components/Icon/IconBell';

type FieldType = {
    project_name?: string;
    from_date?: string;
    to_date?: string;
    customer?: string;
};

const Software_Logs = () => {
    const [form] = Form.useForm();

    const router = useRouter();

    const editorRef: any = useRef();

    const { CKEditor, ClassicEditor } = editorRef.current || {};

    const [messageApi, contextHolder] = message.useMessage();

    const [state, setState] = useSetState({
        logList: [],
        currentPage: 1,
        subModuleOption: [],
        moduleOption: [
            {
                label: 'People',
                value: 'people',
            },
            {
                label: 'Master',
                value: 'master',
            },
            {
                label: 'Invoice',
                value: 'invoice',
            },
            {
                label: 'Users',
                value: 'user',
            },
        ],
        tableData: [],
        columns: [],
        empData: null,
        cusData: null,
        disData: null,
        disOpen: false,
        employeeOpen: false,
        cusOpen: false,
        editorLoaded: false,
        expenceCatData: null,
        expenceCatOpen: false,
        invoiceSubMenuOption: [],
        inDisData: null,
        inDisOpen: false,
        inPaymentData: null,
        inPaymentOpen: false,
        inTestData: null,
        inTestOpen: false,
    });

    useEffect(() => {
        if (state.subModule?.value == 'employee') {
            employeeList(1);
        } else if (state.subModule?.value == 'customer') {
            customerList(1);
        } else if (state.subModule?.value == 'city') {
            cityList(1);
        } else if (state.subModule?.value == 'discount') {
            discountList(1);
        } else if (state.subModule?.value == 'tax') {
        } else if (state.subModule?.value == 'material') {
            materialList(1);
        } else if (state.subModule?.value == 'expence_category') {
            expenceCategoryList(1);
        } else if (state.subModule?.value == 'test') {
            testList(1);
        } else if (state.invoiceSubModule?.value == 'invoice') {
            invoiceHistory(1);
        } else if (state.invoiceSubModule?.value == 'invoice_test') {
            invoiceTestList(1);
        } else if (state.invoiceSubModule?.value == 'invoice_payment') {
            invoicePaymentList(1);
        } else if (state.invoiceSubModule?.value == 'invoice_discount') {
            invoiceDiscountList(1);
        }
        setState({ editorLoaded: true });
    }, [state.subModule, state.invoiceSubModule]);

    const employeeList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('employee', page, null);
            tableFormat(res, page, 'employee');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const customerList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('customer', page, null);
            tableFormat(res, page, 'customer');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const discountList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('customer-discount', page, null);
            tableFormat(res, page, 'discount');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const materialList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('material', page, null);
            tableFormat(res, page, 'material');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const testList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('test', page, null);
            tableFormat(res, page, 'test');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const expenceCategoryList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('expense', page, null);
            tableFormat(res, page, 'expence');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const cityList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('city', page, null);
            tableFormat(res, page, 'city');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const invoiceHistory = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('invoice', page, null);
            tableFormat(res, page, 'invoice');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const invoiceTestList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('invoice-test', page, null);
            tableFormat(res, page, 'invoice-test');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const invoicePaymentList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('receipt', page, null);
            tableFormat(res, page, 'receipt');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const invoiceDiscountList = async (page: number) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList('invoice-discount', page, null);
            tableFormat(res, page, 'invoice-discount');
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('error: ', error);
        }
    };

    const viewEmployee = async (record: any) => {
        try {
            const res = await Models.customer.detail('employee', record?.id);
            setState({ empData: res, employeeOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewCustomer = async (record: any) => {
        try {
            const res = await Models.customer.detail('customer', record?.id);
            setState({ cusData: res, cusOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewDiscount = async (record: any) => {
        try {
            const res = await Models.discount.details(record?.id);
            setState({ disData: res, disOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewCity = async (record: any) => {
        try {
            const res = await Models.city.detail(record?.id);
            setState({ cityData: res, cityOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewMaterial = async (record: any) => {
        try {
            const res = await Models.material.detail(record?.id);
            setState({ materialData: res, materialOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewExpenceCategory = async (record: any) => {
        try {
            const res = await Models.expense.detail(record?.id);
            setState({ expenceCatData: res, expenceCatOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewTest = async (record: any) => {
        try {
            const res = await Models.test.detail(record?.id);
            setState({ testData: res, testOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewInvoiceDiscount = async (record: any) => {
        try {
            const res: any = await Models.invoice.getInvoiceDiscount(record?.id);
            console.log('viewInvoiceDiscount --->', res);
            setState({ inDisData: res, inDisOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewInvoicePayment = async (record: any) => {
        try {
            const res: any = await Models.invoice.getPayment(record?.id);
            setState({ inPaymentData: res, inPaymentOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const viewInvoiceTest = async (record: any) => {
        try {
            const res = await Models.invoice.getTest(record?.id);
            setState({ inTestData: res, inTestOpen: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const tableFormat = (res: any, page: number, type: string) => {
        const processedData = res?.results
            .filter((item: any) => item.history_action === 'Created' || item.changes !== null)
            .map((item: any) => ({
                ...item,
                changes: item.changes
                    ? Object.entries(item.changes)
                          .filter(([key]) => key !== 'history_type')
                          .map(([field, change]) => ({
                              field,
                              from: change.from,
                              to: change.to,
                          }))
                    : [],
            }));

        const columns = [
            {
                title: 'Date',
                dataIndex: 'history_date',
                key: 'date',
                render: (date: any) => new Date(date).toLocaleString(),
            },
            {
                title: 'User',
                dataIndex: 'history_user',
                key: 'user',
            },
            {
                title: 'Action',
                dataIndex: 'history_action',
                key: 'action',
            },
            {
                title: 'IP Address',
                dataIndex: 'history_change_reason',
                key: 'ip',
                render: (ip: any) => ip || 'N/A',
            },
            {
                title: 'Changes',
                dataIndex: 'changes',
                key: 'changes',
                render: (changes: any) => (
                    <div>
                        {changes.length > 0 ? (
                            <ul style={{ margin: 0, paddingLeft: 20 }}>
                                {changes.map((change: any, index: number) => (
                                    <li key={index}>
                                        <strong>{change.field}:</strong> {change.from || 'Empty'} → {change.to || 'Empty'}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            ''
                        )}
                    </div>
                ),
            },
            {
                title: 'Actions',
                key: 'actions',
                className: 'singleLineCell',
                render: (record: any) => (
                    <div className=" flex gap-4">
                        {(type == 'invoice-test' || type == 'receipt' || type == 'invoice-discount') && (
                            <InfoCircleOutlined style={{ cursor: 'pointer' }} className="view-icon" rev={undefined} onClick={() => viewInvoiceRecord(type, record)} />
                        )}
                        <EyeOutlined style={{ cursor: 'pointer' }} className="view-icon" rev={undefined} onClick={() => viewRecord(type, record)} />
                    </div>
                ),
            },
        ];
        setState({ loading: false, tableData: processedData, columns, currentPage: page, total: res?.count });
    };

    const viewInvoiceRecord = (type: string, record: any) => {
        if (type == 'invoice-discount') {
            viewInvoiceDiscount(record);
        } else if (type == 'receipt') {
            viewInvoicePayment(record);
        } else if (type == 'invoice-test') {
            viewInvoiceTest(record);
        }
    };

    const viewRecord = (type: string, record: any) => {
        if (type == 'discount') {
            viewDiscount(record);
        } else if (type == 'employee') {
            viewEmployee(record);
        } else if (type == 'customer') {
            viewCustomer(record);
        } else if (type == 'city') {
            viewCity(record);
        } else if (type == 'material') {
            viewMaterial(record);
        } else if (type == 'expence') {
            viewExpenceCategory(record);
        } else if (type == 'test') {
            viewTest(record);
        } else if (type == 'invoice') {
            window.open(`/invoice/edits?id=${record?.id}`, '_blank');
        } else if (type == 'invoice-discount' || type == 'receipt' || type == 'invoice-test') {
            window.open(`/invoice/edits?id=${record?.custom_info?.invoice_id}`, '_blank');
        }
    };

    const filterSubmit = (values: any) => {};

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });

        return number;
    };

    const handleSetSubmenu = (data: any) => {
        let menu: any = [];
        if (data?.value == 'people') {
            menu = [
                {
                    label: 'Customer',
                    value: 'customer',
                },
                {
                    label: 'Employee',
                    value: 'employee',
                },
            ];
        } else if (data?.value == 'master') {
            menu = [
                {
                    label: 'Discount',
                    value: 'discount',
                },

                {
                    label: 'Material',
                    value: 'material',
                },
                {
                    label: 'Test',
                    value: 'test',
                },
                {
                    label: 'Expence Category',
                    value: 'expence_category',
                },
                {
                    label: 'City',
                    value: 'city',
                },
            ];
        } else if (data?.value == 'invoice') {
            menu = [
                {
                    label: 'Invoice',
                    value: 'invoice',
                },

                {
                    label: 'Expence Entry',
                    value: 'expence_entry',
                },
                {
                    label: 'File Upload',
                    value: 'file_upload',
                },
            ];
        } else if (data?.value == 'user') {
            menu = [
                {
                    label: 'Change Password',
                    value: 'change_password',
                },
            ];
        }
        setState({ subModuleOption: menu });
    };

    return (
        <>
            <div className="panel">
                {contextHolder}

                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={filterSubmit} autoComplete="off">
                        <div className="sale_report_inputs gap-3">
                            <Form.Item label="Module" name="customer" style={{ width: '300px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => {}}
                                    value={state.module}
                                    options={state.moduleOption}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        form.setFieldsValue({ module: selectedOption, subModule: null });
                                        handleSetSubmenu(selectedOption);
                                    }}
                                    loadMore={() => {}}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <Form.Item label="Module" name="subModule" style={{ width: '300px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => {}}
                                    value={state.subModule}
                                    options={state.subModuleOption || []}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        setState({ subModule: selectedOption });
                                        form.setFieldsValue({ subModule: selectedOption });
                                        if (selectedOption?.value == 'invoice') {
                                            setState({
                                                invoiceSubMenuOption: [
                                                    {
                                                        label: 'Invoice History',
                                                        value: 'invoice',
                                                    },

                                                    {
                                                        label: 'Invoice Test History',
                                                        value: 'invoice_test',
                                                    },
                                                    {
                                                        label: 'Invoice Payment History',
                                                        value: 'invoice_payment',
                                                    },

                                                    {
                                                        label: 'Invoice Discount History',
                                                        value: 'invoice_discount',
                                                    },
                                                ],
                                            });
                                        }
                                    }}
                                    loadMore={() => {}}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>
                            {state.subModule?.value == 'invoice' && (
                                <Form.Item label="Invoice Sub Module" name="invoice_sub_module" style={{ width: '300px' }}>
                                    <CustomSelect
                                        onSearch={(data: any) => {}}
                                        value={state.invoiceSubModule}
                                        options={state.invoiceSubMenuOption || []}
                                        className=" flex-1"
                                        onChange={(selectedOption: any) => {
                                            setState({ invoiceSubModule: selectedOption });
                                            form.setFieldsValue({ invoice_sub_module: selectedOption });
                                        }}
                                        loadMore={() => {}}
                                        isSearchable
                                        filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                    />
                                </Form.Item>
                            )}
                            {/* <Form.Item<FieldType> label="Project Name" name="project_name" style={{ width: '250px' }}>
                                <Input />
                            </Form.Item> */}

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            {/*<Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Software Logs</h1>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table dataSource={state.tableData} columns={state.columns} pagination={false} scroll={scrollConfig} loading={state.loading} />
                    {state.logList?.length > 0 && (
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

            <Modal title="View Employee" open={state.employeeOpen} onCancel={() => setState({ employeeOpen: false })} footer={false}>
                {employeeData(state.empData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Discount" open={state.disOpen} onCancel={() => setState({ disOpen: false })} footer={false}>
                {discountData(state.disData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Customer" open={state.cusOpen} onCancel={() => setState({ cusOpen: false })} footer={false}>
                {customerData(state.cusData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View City" open={state.cityOpen} onCancel={() => setState({ cityOpen: false })} footer={false}>
                {cityData(state.cityData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Material" open={state.materialOpen} onCancel={() => setState({ materialOpen: false })} footer={false}>
                {state.materialData && (
                    <div className="flex flex-col gap-2">
                        <div>
                            <p className="font-bold">{'Material Name'}</p>
                            <p className="">{state.materialData?.material_name}</p>
                        </div>
                        <div>
                            <p className="font-bold">{'Print Format'}</p>
                            <p className="">{state.materialData?.print_format?.name}</p>
                        </div>
                        <div>
                            <p className="font-bold">{'letter_pad_logo'}</p>
                            <p className="">{state.materialData?.letter_pad_logo?.name}</p>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal title="View Test" open={state.testOpen} onCancel={() => setState({ testOpen: false })} footer={false}>
                {testData(state.testData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Expense Category" open={state.expenceCatOpen} onCancel={() => setState({ expenceCatOpen: false })} footer={false}>
                {expenseCatData(state.expenceCatData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Invoice" open={state.inDisOpen} onCancel={() => setState({ inDisOpen: false })} footer={false}>
                {invoiceDisData(state.inDisData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Invoice" open={state.inPaymentOpen} onCancel={() => setState({ inPaymentOpen: false })} footer={false}>
                {invoicePaymentData(state.inPaymentData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Test" open={state.inTestOpen} onCancel={() => setState({ inTestOpen: false })} footer={false}>
                {invoiceTestData(state.inTestData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>
        </>
    );
};

export default Software_Logs;
