import React, { useState, useEffect } from 'react';
import { DatePicker, Space, Table, Spin, Button, Drawer, Form, Input, Select } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import dayjs from 'dayjs';
import { baseUrl, useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import Models from '@/imports/models.import';

const Invoice = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    console.log('✌️dataSource --->', dataSource);
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
    });

    // useEffect(() => {
    //     getInvoice();
    // }, []);

    useEffect(() => {
        axios
            .get(`${baseUrl}/create_invoice/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                console.log('useEffect --->', res);
                setFormFields(res.data);
            })
            .catch((error: any) => {
                if (error.response?.status === 401) {
                    router.push('/');
                }
            });
    }, []);

    // const getInvoice = () => {
    //     axios
    //         .get('${baseUrl}/invoice_list/', {
    //             headers: {
    //                 Authorization: `Token ${localStorage.getItem('token')}`,
    //             },
    //         })
    //         .then((res) => {
    //             setDataSource(res?.data);
    //             // setFilterData(res.data);
    //         })
    //         .catch((error: any) => {
    //             if (error.response.status === 401) {
    //                 router.push('/');
    //             }
    //         });
    // };

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
                    return dayjs(text).format('DD-MM-YYYY');
                } else {
                    return '';
                }
            },
        },
        {
            title: 'Customer Name',
            dataIndex: 'customer',
            key: 'customer',
            className: 'singleLineCell',
        },
        {
            title: 'Project Name',
            dataIndex: 'project_name',
            key: 'project_name',
            className: 'singleLineCell',
        },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            className: 'singleLineCell',
        },
        {
            title: 'Balance',
            dataIndex: 'balance',
            key: 'balance',
            className: 'singleLineCell',
        },
        {
            title: 'Incompleted Test',
            dataIndex: 'incompleted_test',
            key: 'incompleted_test',
            className: 'singleLineCell',
            width: 150,
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
                    {/* <DeleteOutlined
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={() => handleDelete(record)} className='delete-icon' rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    const handleEditClick = (record: any) => {
        // Navigate to the /invoice/edit page with the record data as a query parameter
        window.location.href = `/invoice/edits?id=${record.id}`;
    };

    // const handleDelete = (record: any) => {
    //     // Implement your delete logic here

    //     Modal.confirm({
    //         title: "Are you sure, you want to delete this TAX record?",
    //         okText: "Yes",
    //         okType: "danger",
    //         onOk: () => {
    //             console.log(record, "values")
    //             axios.delete(`${baseUrl}/delete_invoice/${record.id}`, {
    //                 headers: {
    //                     "Authorization": `Token ${localStorage.getItem("token")}`
    //                 }
    //             }).then((res) => {
    //                 console.log(res)
    //                 getInvoice()
    //             }).catch((err: any) => {
    //                 console.log(err)
    //             })

    //         },

    //     });
    // };

    // input search

    // const inputChange = (e: any) => {
    //     const SearchValue = e.target.value;

    //     const filteredData = dataSource.filter((item: any) => {
    //         return (
    //             item.invoice_no.includes(SearchValue) ||
    //             item.customer.toLowerCase().includes(SearchValue.toLowerCase()) ||
    //             item.project_name.toLowerCase().includes(SearchValue.toLowerCase()) ||
    //             item.total_amount.includes(SearchValue) ||
    //             item.balance.includes(SearchValue) ||
    //             item.incompleted_test.includes(SearchValue)
    //         );
    //     });
    //     setFilterData(filteredData);
    // };

    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        const body = {
            customer: values.customer,
            project_name: values.project_name,
            advance: values.advance,
            balance: values.balance,
            discount: values.discount,
            sales_mode: values.sales_mode,
            tax: values.tax,
            id: values.id,
        };

        axios
            .post(`${baseUrl}/create_invoice/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                initialData(1);
                window.location.href = `/invoice/edits?id=${res?.data?.id}`;
                setOpen(false);
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });

        form.resetFields();
        onClose();
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
            // setState({ loading: true });

            const res: any = await Models.discount.details(id);

            // setCustomerList(res?.customer);
            setState({ discount: res?.discount });
        } catch (error: any) {
            // setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    // search

    useEffect(() => {
        initialData(1);
    }, []);

    const initialData = async (page: any) => {
        try {
            // const body = bodyData();

            // console.log('body', body);

            setState({ loading: true });

            const res: any = await Models.invoice.invoiceList(page);
            console.log('abcd --->', res);
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
    console.log('✌️currentPage --->', state.currentPage);

    const bodyData = () => {
        const body: any = {};
        if (state.searchValue) {
            if (state.searchValue.completed !== undefined) {
                body.completed = state.searchValue.completed;
            }
            if (state.searchValue.customer !== undefined) {
                body.customer = state.searchValue.customer;
            }
            if (state.searchValue.from_date !== undefined) {
                body.from_date = state.searchValue.from_date;
            }

            if (state.searchValue.project_name !== undefined) {
                body.project_name = state.searchValue.project_name;
            }
            if (state.searchValue.to_date !== undefined) {
                body.to_date = state.searchValue.to_date;
            }
        }

        return body;
    };

    // form submit
    const onFinish2 = (values: any, page = 1) => {
        const Token = localStorage.getItem('token');

        const body = {
            project_name: values.project_name ? values.project_name : '',
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            customer: values.customer ? values.customer : '',
            completed: values.completed ? values.completed : '',
        };

        axios
            .post(`${baseUrl}/invoice_list/?page=${page}`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setState({
                    invoiceList: res?.data?.results,
                    currentPage: page,
                    pageNext: res?.data?.next,
                    pagePrev: res?.data?.previous,
                    total: res?.data?.count,
                    loading: false,
                    searchValue: values,
                });
                // setDataSource(res?.data);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
        // form.resetFields();
    };

    console.log('searchValue', state.searchValue);

    const onFinishFailed2 = (errorInfo: any) => {};

    // const handlePageChange = (number:any) => {

    //     return number;
    //   };

    const handlePageChange = (number: any) => {
        console.log('number', number);
        setState({ currentPage: number });

        if (state.searchValue) {
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
                        <div className="sale_report_inputs">
                            <Form.Item label="Project Name" name="project_name" style={{ width: '200px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Customer" name="customer" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {formFields?.customer?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.customer_name}
                                        </Select.Option>
                                    ))}
                                </Select>
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
                                {/* { state.searchValue &&  */}
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
                                {/* } */}
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '100px' }}>
                                        Search
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
                <Drawer title="Create Invoice" placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic-form" layout="vertical" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off" form={form}>
                        <Form.Item label="Customer Name" name="customer" required={false} rules={[{ required: true, message: 'Please select Customer Name!' }]}>
                            <Select
                                onChange={handleSelectChange}
                                placeholder="Select a customer"
                                value={selectedCustomerId}
                                showSearch
                                filterOption={(input, option: any) =>
                                    option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {formFields?.customer?.map((val: any) => (
                                    <Select.Option key={val.id} value={val.id}>
                                        {val.customer_name} - {val.phone_no}
                                    </Select.Option>
                                ))}
                            </Select>
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
                                    <Button type="primary" htmlType="submit">
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
