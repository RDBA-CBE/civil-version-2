import React, { useState, useEffect, useRef } from 'react';
import { Button, DatePicker, Form, Input, Modal, Space, Table, message } from 'antd';
import Models from '@/imports/models.import';
import { capitalizeFLetter, Failure, roundNumber, useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import {
    cityData,
    customerData,
    discountData,
    employeeData,
    expenseCatData,
    expenseEntryData,
    invoiceDisData,
    invoiceFileData,
    invoicePaymentData,
    invoiceTestData,
    quotationData,
    scrollConfig,
    testData,
    userData,
} from '@/utils/constant';
import CustomSelect from '@/components/Select';
import { EyeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import moment from 'moment';

type LogType =
    | 'employee'
    | 'customer'
    | 'city'
    | 'discount'
    | 'tax'
    | 'material'
    | 'expence_category'
    | 'test'
    | 'invoice'
    | 'invoice-test'
    | 'invoice-payment'
    | 'invoice-discount'
    | 'quotation'
    | 'quotation-item'
    | 'change_password';

const Software_Logs = () => {
    const [form] = Form.useForm();

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
        inQuaData: null,
        inQuaOpen: false,
        btnLoading: false,
        selectedrec: null,
        userData: null,
        userOpen: false,
        module: { value: 'people', lable: 'People' },
        expenceEntryData: null,
        expenceEntryOpen: false,
        invoiceFileData: null, invoiceFileOpen: false 
    });

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        assignInitialRecord();
    }, []);

    const assignInitialRecord = () => {
        fetchAndFormatLogs('invoice', 1);
        form.setFieldsValue({
            module: { value: 'invoice', label: 'Invoice' },
            subModule: {
                label: 'Invoice',
                value: 'invoice',
            },
            from_date: null,
            to_date: null,
            invoice_sub_module: {
                label: 'Invoice History',
                value: 'invoice',
            },
        });

        setState({
            subModuleOption: [
                {
                    label: 'Invoice',
                    value: 'invoice',
                },

                {
                    label: 'Quotation',
                    value: 'quotation',
                },

                {
                    label: 'Expense Entry',
                    value: 'expense_entry',
                },
                {
                    label: 'File Upload',
                    value: 'file_upload',
                },
            ],
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
            invoiceSubModule: {
                label: 'Invoice History',
                value: 'invoice',
            },
            subModule: {
                label: 'Invoice History',
                value: 'invoice',
            },
        });
    };
    const getData = async () => {
        try {
            if (!state.subModule?.value && !state.invoiceSubModule?.value) {
                setState({ loading: false, tableData: [], columns: [], currentPage: 1, total: 0, invoiceSubModule: null, subModule: null });

                return;
            }

            const page = 1; // Default page
            const typeMap: any = {
                employee: 'employee',
                customer: 'customer',
                city: 'city',
                discount: 'customer-discount',
                tax: 'tax',
                material: 'material',
                expence_category: 'expense',
                test: 'test',
                expense_entry: 'expense-entry',
                file_upload: 'invoice-file',
                // Invoice sub-modules
                invoice: 'invoice',
                invoice_test: 'invoice-test',
                invoice_payment: 'receipt',
                invoice_discount: 'invoice-discount',
                quotation: 'quotation',
                quotation_item: 'quotation-item',
                change_password: 'user',
            };

            let type = null;

            if (state?.invoiceSubModule?.value) {
                type = state?.invoiceSubModule?.value;
            } else if (state.subModule?.value) {
                type = state.subModule?.value;
            } else {
                type = state.invoiceSubModule?.value;
            }
            if (type && typeMap[type]) {
                fetchAndFormatLogs(typeMap[type], page);
            } else {
                setState({ loading: false, tableData: [], columns: [], currentPage: 1, total: 0 });
            }

            setState({ editorLoaded: true });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const filterSubmit = (values: any) => {
        let body: any = {};
        if (values?.from_date) {
            const from_date = dayjs(values.from_date).format('YYYY-MM-DD');
            body.from_date = from_date;
        }
        if (values?.to_date) {
            const to_date = dayjs(values.to_date).format('YYYY-MM-DD');

            body.to_date = to_date;
        }

        if (values?.subModule) {
            const typeMap: any = {
                employee: 'employee',
                customer: 'customer',
                city: 'city',
                discount: 'customer-discount',
                tax: 'tax',
                material: 'material',
                expence_category: 'expense',
                test: 'test',
                expense_entry: 'expense-entry',
                file_upload: 'invoice-file',
                // Invoice sub-modules
                invoice: 'invoice',
                invoice_test: 'invoice-test',
                invoice_payment: 'receipt',
                invoice_discount: 'invoice-discount',
                quotation: 'quotation',
                quotation_item: 'quotation-item',
                change_password: 'user',
            };
            let type = null;
            if (values?.invoice_sub_module?.value) {
                type = values?.invoice_sub_module?.value;
            } else if (values.subModule?.value) {
                type = values.subModule?.value;
            } else {
                type = values.invoiceSubModule?.value;
            }

            filterData(typeMap[type], 1, body);
        }
    };

    const filterData = async (type: LogType, page = 1, body = null) => {
        try {
            setState({ loading: true });
            const res: any = await Models.logs.softwareLogList(type, page, body);
            tableFormat(res, page, type);
            setState({ loading: false, currentPage: page, total: res?.count });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const bodyData = () => {
        let body: any = {};
        if (state?.from_date) {
            const from_date = dayjs(state.from_date).format('YYYY-MM-DD');
            body.from_date = from_date;
        }
        if (state?.to_date) {
            const to_date = dayjs(state.to_date).format('YYYY-MM-DD');

            body.to_date = to_date;
        }

        if (state?.subModule) {
            const typeMap: any = {
                employee: 'employee',
                customer: 'customer',
                city: 'city',
                discount: 'customer-discount',
                tax: 'tax',
                material: 'material',
                expence_category: 'expense',
                test: 'test',
                expense_entry: 'expense-entry',
                file_upload: 'invoice-file',
                // Invoice sub-modules
                invoice: 'invoice',
                invoice_test: 'invoice-test',
                invoice_payment: 'receipt',
                invoice_discount: 'invoice-discount',
                quotation: 'quotation',
                quotation_item: 'quotation-item',
                change_password: 'user',
            };
            let type = null;
            // const type = state.invoiceSubModule?.value || state.subModule?.value;

            if (state?.invoiceSubModule?.value) {
                type = state?.invoiceSubModule?.value;
            } else if (state.subModule?.value) {
                type = state.subModule?.value;
            } else {
                type = state.invoiceSubModule?.value;
            }
            body.type = typeMap[type];
        }

        return body;
    };

    const fetchAndFormatLogs = async (type: LogType, page = 1) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.logs.softwareLogList(type, page, body);
            tableFormat(res, page, type);
            setState({ loading: false, currentPage: page, total: res?.count });
        } catch (error) {
            setState({ loading: false });
            console.log('error: ', error);
        }
    };

    const viewEmployee = async (record: any) => {
        try {
            const res = await Models.customer.detail('employee', record?.id);
            setState({ empData: res, employeeOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewCustomer = async (record: any) => {
        try {
            const res = await Models.customer.detail('customer', record?.id);
            setState({ cusData: res, cusOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewDiscount = async (record: any) => {
        try {
            const res = await Models.discount.details(record?.id);
            setState({ disData: res, disOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewCity = async (record: any) => {
        try {
            const res = await Models.city.detail(record?.id);
            setState({ cityData: res, cityOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewMaterial = async (record: any) => {
        try {
            const res = await Models.material.detail(record?.id);
            setState({ materialData: res, materialOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewExpenceCategory = async (record: any) => {
        try {
            const res = await Models.expense.detail(record?.id);
            setState({ expenceCatData: res, expenceCatOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewExpenceEntry = async (record: any) => {
        try {
            const res = await Models.expense.expenseEntryDetail(record?.id);
            setState({ expenceEntryData: res, expenceEntryOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewInvoiceFile = async (record: any) => {
        try {
            const res = await Models.invoiceFile.getInvoiceFile(record?.id);
            setState({ invoiceFileData: res, invoiceFileOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewTest = async (record: any) => {
        try {
            const res = await Models.test.detail(record?.id);
            setState({ testData: res, testOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewUser = async (record: any) => {
        try {
            const res: any = await Models.auth.detail(record?.custom_info?.employee_id);
            setState({ userData: { ...res, roles: record?.is_admin }, userOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewInvoiceDiscount = async (record: any) => {
        try {
            const res: any = await Models.invoice.getInvoiceDiscount(record?.id);
            setState({ inDisData: res, inDisOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewInvoicePayment = async (record: any) => {
        try {
            const res: any = await Models.invoice.getPayment(record?.id);
            setState({ inPaymentData: res, inPaymentOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewInvoiceTest = async (record: any) => {
        try {
            const res = await Models.invoice.getTest(record?.id);
            setState({ inTestData: res, inTestOpen: true });
        } catch (error: any) {
            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const viewQuotationItem = async (record: any) => {
        try {
            setState({ btnLoading: true });
            const res = await Models.qoutation.detail(record?.id);
            setState({ inQuaData: res, inQuaOpen: true, btnLoading: false });
        } catch (error: any) {
            setState({ btnLoading: false });

            if (error?.detail == 'Not found.') {
                Failure('Record Deleted');
            }
            console.log('✌️error --->', error);
        }
    };

    const tableFormat = (res: any, page: number, type: string) => {
        const processedData = res?.results.map((item: any) => ({
            ...item,
            changes: item?.changes
                ? Object.entries(item?.changes)
                      .filter(([key]) => key !== 'history_type')
                      .map(([field, change]: [string, any]) => ({
                          field,
                          from: change.from,
                          to: change.to,
                      }))
                : item?.history_action === 'Created'
                ? [{ field: 'New Record Created', from: null, to: null }]
                : item?.history_action === 'Deleted'
                ? [{ field: 'Record Deleted', from: null, to: null }]
                : [{ field: 'No changes', from: null, to: null }],
        }));

        const columns = [
            {
                title: 'Date',
                dataIndex: 'history_date',
                key: 'date',
                render: (date: any) => (date ? moment(date)?.format('DD/MM/YYYY HH:mm a') : ''),
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
                            changes[0].field === 'No changes' || changes[0].field === 'New Record Created' || changes[0].field === 'Record Deleted' ? (
                                <span>{changes[0].field}</span> // Show simple message
                            ) : (
                                <ul style={{ margin: 0, paddingLeft: 20 }}>
                                    {changes?.map((change: any, index: number) => (
                                        <li key={index}>
                                            <strong>{capitalizeFLetter(change.field)}:</strong> {change.from || 'Empty'} → {change.to || 'Empty'}
                                        </li>
                                    ))}
                                </ul>
                            )
                        ) : null}
                    </div>
                ),
            },
            {
                title: 'Actions',
                key: 'actions',
                className: 'singleLineCell',
                render: (record: any) => (
                    <div className="flex gap-4">
                        {(type === 'invoice-test' || type === 'receipt' || type === 'invoice-discount' || type === 'quotation-item') &&
                            record.history_action !== 'Deleted' && ( // Add this condition
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
        setState({ selectedrec: record?.id });
        if (type == 'invoice-discount') {
            viewInvoiceDiscount(record);
        } else if (type == 'receipt') {
            viewInvoicePayment(record);
        } else if (type == 'invoice-test') {
            viewInvoiceTest(record);
        } else if (type == 'quotation-item') {
            viewQuotationItem(record);
        }
    };

    const viewRecord = (type: string, record: any) => {
        setState({ selectedrec: record?.id });
        if (type == 'customer-discount') {
            viewDiscount(record);
        } else if (type == 'employee') {
            viewEmployee(record);
        } else if (type == 'customer') {
            viewCustomer(record);
        } else if (type == 'city') {
            viewCity(record);
        } else if (type == 'material') {
            viewMaterial(record);
        } else if (type == 'expense') {
            viewExpenceCategory(record);
        } else if (type == 'expense-entry') {
            viewExpenceEntry(record);
        } else if (type == 'invoice-file') {
            viewInvoiceFile(record);
        } else if (type == 'test') {
            viewTest(record);
        } else if (type == 'user') {
            viewUser(record);
        } else if (type == 'invoice') {
            window.open(`/invoice/edits?id=${record?.id}`, '_blank');
        } else if (type == 'invoice-discount' || type == 'receipt' || type == 'invoice-test') {
            window.open(`/invoice/edits?id=${record?.custom_info?.invoice_id}`, '_blank');
        } else if (type == 'quotation') {
            window.open(`/invoice/editQoutations?id=${record?.id}`, '_blank');
        } else if (type == 'quotation-item') {
            window.open(`/invoice/editQoutations?id=${record?.custom_info?.quotation_id}`, '_blank');
        }
    };

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        const body = bodyData();

        filterData(body.type, number, body);

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
                    label: 'Quotation',
                    value: 'quotation',
                },

                {
                    label: 'Expense Entry',
                    value: 'expense_entry',
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

    const handleModule = (option: any) => {
        if (option == null) {
            setState({ subModuleOption: [], subModule: null, invoiceSubMenuOption: [], invoiceSubModule: null });
            form.setFieldsValue({ module: option, subModule: null, invoiceSubModule: null });
        } else {
            if (option?.value == 'people') {
                setState({ subModule: { label: 'Customer', value: 'customer' }, invoiceSubModule: null });
                form.setFieldsValue({ module: option, subModule: { label: 'Customer', value: 'customer' } });
            }
            if (option?.value == 'master') {
                setState({ subModule: { label: 'Discount', value: 'discount' }, invoiceSubModule: null });
                form.setFieldsValue({ module: option, subModule: { label: 'Discount', value: 'discount' } });
            }

            if (option?.value == 'invoice') {
                setState({ subModule: { label: 'Invoice', value: 'invoice' } });
                form.setFieldsValue({
                    module: option,
                    subModule: { label: 'Invoice', value: 'invoice' },
                    invoice_sub_module: {
                        label: 'Invoice History',
                        value: 'invoice',
                    },
                });

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
                    invoiceSubModule: {
                        label: 'Invoice History',
                        value: 'invoice',
                    },
                });
            }
            if (option?.value == 'user') {
                setState({
                    subModule: {
                        label: 'Change Password',
                        value: 'change_password',
                    },
                    invoiceSubMenuOption: [],
                    invoiceSubModule: null,
                });
                form.setFieldsValue({
                    module: option,
                    subModule: {
                        label: 'Change Password',
                        value: 'change_password',
                    },
                    invoiceSubModule: null,
                });
            }

            handleSetSubmenu(option);
        }
    };

    return (
        <>
            <div className="panel">
                {contextHolder}

                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={filterSubmit} autoComplete="off">
                        <div className="sale_report_inputs gap-3">
                            <Form.Item label="Module" name="module" style={{ width: '300px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => {}}
                                    value={state.module}
                                    options={state.moduleOption}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        handleModule(selectedOption);
                                    }}
                                    loadMore={() => {}}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <Form.Item label="Sub Module" name="subModule" style={{ width: '300px' }}>
                                <CustomSelect
                                    onSearch={(data: any) => {}}
                                    value={state.subModule}
                                    options={state.subModuleOption || []}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        if (selectedOption) {
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
                                                    invoiceSubModule: {
                                                        label: 'Invoice History',
                                                        value: 'invoice',
                                                    },
                                                });
                                                form.setFieldsValue({
                                                    invoice_sub_module: {
                                                        label: 'Invoice History',
                                                        value: 'invoice',
                                                    },
                                                });
                                            } else if (selectedOption?.value == 'quotation') {
                                                setState({
                                                    invoiceSubMenuOption: [
                                                        {
                                                            label: 'Quotation History',
                                                            value: 'quotation',
                                                        },

                                                        {
                                                            label: 'Quotation Item History',
                                                            value: 'quotation_item',
                                                        },
                                                    ],
                                                    invoiceSubModule: {
                                                        label: 'Quotation History',
                                                        value: 'quotation',
                                                    },
                                                });
                                                form.setFieldsValue({
                                                    invoice_sub_module: {
                                                        label: 'Quotation History',
                                                        value: 'quotation',
                                                    },
                                                });
                                            } else {
                                                setState({ invoiceSubMenuOption: [], invoiceSubModule: null });
                                                form.setFieldsValue({ invoice_sub_module: null });
                                            }
                                        } else {
                                            setState({ subModule: null });
                                            form.setFieldsValue({ subModule: null });
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

                            {state.subModule?.value == 'quotation' && (
                                <Form.Item label="Quotation Sub Module" name="invoice_sub_module" style={{ width: '300px' }}>
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

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} value={state.from_date} onChange={(e) => setState({ from_date: e })} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} value={state.to_date} onChange={(e) => setState({ to_date: e })} />
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
                                            assignInitialRecord();
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
                    {state.tableData?.length > 0 && (
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

            <Modal title="View Quotation" open={state.inQuaOpen} onCancel={() => setState({ inQuaOpen: false })} footer={false}>
                {quotationData(state.inQuaData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View User" open={state.userOpen} onCancel={() => setState({ userOpen: false })} footer={false}>
                {userData(state.userData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Expense Category" open={state.expenceEntryOpen} onCancel={() => setState({ expenceEntryOpen: false })} footer={false}>
                {expenseEntryData(state.expenceEntryData).map((value: any, index: number) => (
                    <div className="content-main" key={index}>
                        <p className="content-1">{value?.label}</p>
                        <p className="content-2">{value?.value}</p>
                    </div>
                ))}
            </Modal>

            <Modal title="View Invoice File" open={state.invoiceFileOpen} onCancel={() => setState({ invoiceFileOpen: false })} footer={false}>
                {invoiceFileData(state.invoiceFileData).map((value: any, index: number) => (
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
