import React, { useState, useEffect } from 'react';
import { DatePicker, Space, Table, Spin, Button, Drawer, Form, Input, Select, Modal } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import dayjs from 'dayjs';
import { baseUrl, ObjIsEmpty, roundNumber, useSetState, Dropdown, commomDateFormat } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import Models from '@/imports/models.import';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import IconLoader from '@/components/Icon/IconLoader';

const Invoice = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [formFields, setFormFields] = useState<any>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customerAddress, setCustomerAddress] = useState('');
    const [loading, setLoading] = useState(false);

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
        customerList: [],
        customerHasNext: null,
        customerCurrentPage: null,
    });

    useEffect(() => {
        customersList();
    }, []);

    useEffect(() => {
        axios
            .get(`${baseUrl}/create_invoice/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setFormFields(res.data);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
    }, []);

    const getInvoice = async (page: number) => {
        try {
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

    // drawer
    const showDrawer = () => {
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
        setCustomerAddress('');
    };

    const columns = [
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            width: 100,
        },

        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            className: 'singleLineCell',
            width: 100,
            render: (text: any, record: any) => {
                if (text) {
                    return commomDateFormat(text);
                } else {
                    return '';
                }
            },
        },
        {
            title: 'Customer Name',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record?.customer?.customer_name}</div>;
            },
        },
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            className: 'singleLineCell',
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
        {
            title: 'Incompleted Test',
            dataIndex: 'completed',
            key: 'incompleted_test',
            className: 'singleLineCell',
        },
        {
            title: 'Actions',
            key: 'actions',
            className: 'singleLineCell',
            render: (text: any, record: any) => (
                <Space size="middle">
                    {/* <Link href='/invoice/preview/'>
                        <EyeOutlined style={{ cursor: "pointer" }}
                            className='view-icon' rev={undefined} />
                    </Link> */}

                    {/* 

                    {
                        localStorage.getItem('admin') === 'true' ? (
                            <span
                                onClick={() => handleEditClick(record)}
                                style={{ cursor: "pointer" }}
                                className='edit-icon'
                            >
                                <EditOutlined rev={undefined} />
                            </span>
                        ) : (
                            <span
                                onClick={() => handleEditClick(record)}
                                style={{ cursor: "pointer", display:"none" }}
                                className='edit-icon'
                            >
                                <EditOutlined rev={undefined} />
                            </span>
                        )
                    } */}

                    <span onClick={() => handleEditClick(record)} style={{ cursor: 'pointer' }} className="edit-icon">
                        <EditOutlined rev={undefined} />
                    </span>
                    {/* <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDelete(record)} className="delete-icon" rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    const exportToExcel = async () => {
        setState({ excelBtnLoading: true });

        let allData: any[] = [];
        let currentPage = 1;
        let hasNext = true;

        while (hasNext) {
            const body = bodyData();
            const res: any = await Models.invoice.invoiceList(currentPage);

            allData = allData.concat(res?.results || []);

            if (res?.next) {
                currentPage += 1;
            } else {
                hasNext = false;
            }
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        worksheet.addRow(['Invoice No', 'Date', 'Customer Name', 'Project Name', 'After Tax Amount', 'Balance']);

        allData.forEach((item: any) => {
            worksheet.addRow([item.invoice_no, commomDateFormat(item.date), item.customer?.customer_name, item?.project_name, item?.after_tax_amount, item?.balance]);
        });

        // Generate a Blob containing the Excel file
        const blob = await workbook.xlsx.writeBuffer();

        // Use file-saver to save the Blob as a file
        FileSaver.saveAs(
            new Blob([blob], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            `Invoice-Report.xlsx`
        );

        setState({ excelBtnLoading: false });
    };

    const handleEditClick = (record: any) => {
        // Navigate to the /invoice/edit page with the record data as a query parameter
        window.location.href = `/invoice/edits?id=${record.id}`;
    };

    const handleDelete = (record: any) => {
        // Implement your delete logic here

        Modal.confirm({
            title: 'Are you sure, you want to delete this invoice record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                deleteInvoice(record);
            },
        });
    };

    const deleteInvoice = async (record: any) => {
        try {
            const res: any = await Models.invoice.deleteInvoice(record.id);
            getInvoice(state.currentPage);
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    // form submit
    const handleSubmit = async (values: any) => {
        try {
            setState({ btnLoading: true });

            const body = {
                customer: values.customer.value,
                project_name: values.project_name,
                advance: values.advance,
                balance: values.balance,
                discount: values.discount,
                sales_mode: values.sales_mode,
                tax: values.tax,
                id: values.id,
            };

            const res: any = await Models.invoice.createInvoice(body);
            updateDiscount(res, values);
        } catch (error) {
            setState({ btnLoading: false });

            console.log('✌️error --->', error);
        }
    };

    const updateDiscount = async (invoiceResponse: any, customerData: any) => {
        try {
            if (!invoiceResponse?.customer?.id) {
                console.warn('No customer ID in invoice response');
                return;
            }
            let discountValue = 0;
            const customer: any = await Models.discount.getCustomerDiscount(invoiceResponse.customer.id);
            if (customer?.results?.length > 0) {
                discountValue = customer?.results[0].discount;
            } else {
                discountValue = 0;
            }

            const discountBody = {
                discount: discountValue,
                invoice: invoiceResponse.id,
            };

            await Models.invoice.createInvoiceDiscount(discountBody);
            window.location.href = `/invoice/edits?id=${invoiceResponse?.id}`;
            setOpen(false);
            setState({ btnLoading: false });
            // // Update the discount if needed
            // if (createdDiscount?.id) {
            //     const updatedDiscount = await Models.invoice.updateInvoiceDiscount(createdDiscount.id, discountBody);
            //     console.log('Discount updated:', updatedDiscount);
            // }
        } catch (error) {
            console.error('Error in updateDiscount:', error);
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

    const handleSelectChange = (customerId: any) => {
        const selectedCustomer = formFields?.customer?.find((customer: any) => customer.id === customerId);

        setSelectedCustomerId(customerId);
        setCustomerAddress(selectedCustomer?.address1 || '');
        getCustomerDiscount(customerId);
    };

    const getCustomerDiscount = async (id: any) => {
        try {
            const res: any = await Models.discount.getCustomerDiscount(id);
            if (res?.results?.length > 0) {
                setState({ discount: res?.results[0]?.discount });
            } else {
                setState({ discount: 0 });
            }

            // setState({ discount: res?.discount });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

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
            if (state.searchValue?.completed) {
                body.completed = state.searchValue.completed;
            }
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

    // form submit
    const onFinish2 = async (values: any, page = 1) => {
        try {
            setState({ loading: true });
            const body = {
                project_name: values?.project_name ? values?.project_name : '',
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                customer: values.customer?.value ? values.customer?.value : '',
                completed: values.completed ? values.completed : '',
                invoice_no: values.invoice_no ? values.invoice_no : '',
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

    const onFinishFailed2 = (errorInfo: any) => {};

    // const handlePageChange = (number:any) => {

    //     return number;
    //   };

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

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish2} onFinishFailed={onFinishFailed2} autoComplete="off">
                        <div className="sale_report_inputs gap-3">
                            <Form.Item label="Invoice Number" name="invoice_no" style={{ width: '150px' }}>
                                <Input />
                            </Form.Item>
                            <Form.Item label="Project Name" name="project_name" style={{ width: '200px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Customer" name="customer" style={{ width: '250px' }}>
                                {/* <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {formFields?.customer?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.customer_name}
                                        </Select.Option>
                                    ))}
                                </Select> */}
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

                            <Form.Item label="From Date" name="from_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="Completed Test" name="completed" style={{ width: '200px' }}>
                                <Select>
                                    <Select.Option value="Yes">Yes</Select.Option>
                                    <Select.Option value="No">No</Select.Option>
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Invoices</h1>
                    </div>
                    <div>
                        {/* <Search placeholder="input search text" onChange={inputChange} enterButton className="search-bar" /> */}
                        <button type="button" className="create-button" onClick={() => showDrawer()}>
                            + Create Invoice
                        </button>

                        {/* <button type="button" className="create-button" onClick={() => exportToExcel()}>
                            {state.excelBtnLoading ? <IconLoader /> : 'Excel to export'}
                        </button> */}
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
                <Drawer title="Create Invoice" placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic-form" layout="vertical" initialValues={{ remember: true }} onFinish={handleSubmit} onFinishFailed={onFinishFailed} autoComplete="off" form={form}>
                        <Form.Item label="Customer Name" name="customer" required={false} rules={[{ required: true, message: 'Please select Customer Name!' }]}>
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

                        <Form.Item>
                            <Input.TextArea rows={4} value={customerAddress} />
                        </Form.Item>

                        <Form.Item label="Discount" name="Discount" required={false}>
                            <Input placeholder={state.discount} disabled={true} />
                        </Form.Item>
                        <Form.Item label="Project Name" name="project_name" required={false} rules={[{ required: true, message: 'Please input your Project Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item>
                            {/* <Space> */}
                            <div className="form-btn-main">
                                <Space>
                                    <Button danger htmlType="submit" onClick={() => onClose()}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={state.btnLoading}>
                                        Submit
                                    </Button>
                                </Space>
                            </div>
                            {/* <Button htmlType="submit" style={{ borderColor: "blue", color: "blue" }}>
                                        Add Invoice Test
                                    </Button> */}
                            {/* </Space> */}
                        </Form.Item>
                        {/* </div> */}
                    </Form>
                </Drawer>
            </div>
        </>
    );
};

export default Invoice;
