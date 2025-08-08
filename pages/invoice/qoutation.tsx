import React, { useState, useEffect } from 'react';
import { DatePicker, Space, Table, Spin, Button, Drawer, Form, Input, Select, Checkbox } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import dayjs from 'dayjs';
import { baseUrl, ObjIsEmpty, roundNumber, useSetState, Dropdown, commomDateFormat } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import Models from '@/imports/models.import';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';

const Quotations = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [formFields, setFormFields] = useState<any>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);
    const [customerAddress, setCustomerAddress] = useState('');
    const [loading, setLoading] = useState(false);
    // const [taxData, setTaxData] = useState<any>([]);
    // const [checkedItems, setCheckedItems] = useState({});

    // useEffect(() => {
    //     getInvoice();
    // }, []);

    useEffect(() => {
        getQuotation(1);
    }, []);

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        searchValue: null,
        qoutationList: [],
        customerList: [],
        customerHasNext: null,
        customerCurrentPage: null,
    });

    useEffect(() => {
        customersList();
        initialData(1);
    }, []);

    const initialData = async (page: any) => {
        try {
            setState({ loading: true });

            const res: any = await Models.qoutation.qoutationList(page);
            setState({
                qoutationList: res?.results,
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

    const getQuotation = async (page: number) => {
        try {
            const res: any = await Models.qoutation.qoutationList(page);

            setState({
                qoutationList: res?.results,
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

    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        axios
            .post(`${baseUrl}/customers/`, values, {
                headers: { Authorization: `Token ${Token}` },
            })
            .then((res) => {
                CreateQuotations(res.data.id);
                // initialData();
                // window.location.href = `/invoice/editQoutation?id=${res?.data?.id}`;
                // setOpen(false);
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });

        form.resetFields();
        onClose();
    };

    const CreateQuotations = (id: any) => {
        const Token = localStorage.getItem('token');

        const body = {
            customer: id,
            tax: [1, 2],

            // project_name: values.project_name ? values.project_name : '',
            // taxes: Object.keys(checkedItems),
        };
        axios
            .post(`${baseUrl}/quotations/create/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                initialData(1);
                window.location.href = `/invoice/editQoutations?id=${res?.data?.id}`;
                setOpen(false);
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
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

    const handleDelete = async (record: any) => {
        try {
            const res = await Models.qoutation.delete(record?.id);
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const columns = [
        {
            title: 'Quotation No',
            dataIndex: 'quotation_number',
            key: 'quotation_number',
            className: 'singleLineCell',
            width: 150,
        },

        {
            title: 'Date',
            dataIndex: 'date_created',
            key: 'date_created',
            className: 'singleLineCell',
            width: 150,
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
            dataIndex: 'customer',
            key: 'customer',
            className: 'singleLineCell',
        },
        // {
        //     title: 'Project Name',
        //     dataIndex: 'project_name',
        //     key: 'project_name',
        //     className: 'singleLineCell',
        // },
        {
            title: 'Total Amount',
            dataIndex: 'total_amount',
            key: 'total_amount',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
        },
        // {
        //     title: 'Balance',
        //     dataIndex: 'balance',
        //     key: 'balance',
        //     className: 'singleLineCell',
        // },
        {
            title: 'Completed Test',
            dataIndex: 'completed',
            key: 'completed',
            className: 'singleLineCell',
            width: 150,
            render: (text: any, record: any) => {
                if (text === true) {
                    return 'Yes';
                } else {
                    return 'No';
                }
            },
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

    const handleEditClick = (record: any) => {
        // Navigate to the /invoice/edit page with the record data as a query parameter
        window.location.href = `/invoice/editQoutations?id=${record.id}`;
    };

    // form submit

    const onFinishFailed = (errorInfo: any) => {};

    const handleSelectChange = (customerId: any) => {
        const selectedCustomer = formFields?.customer?.find((customer: any) => customer.id === customerId);

        setSelectedCustomerId(customerId);
        setCustomerAddress(selectedCustomer?.address1 || '');
    };

    // search

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

            if (state.searchValue?.to_date) {
                body.to_date = state.searchValue.to_date;
            }
        }

        return body;
    };

    // form submit
    const onFinish2 = async (values: any, page = 1) => {
        try {
            setState({ loading: true });
            const body = {
                // project_name: values.project_name ? values.project_name : '',
                from_date: values?.start_date ? dayjs(values?.start_date).format('YYYY-MM-DD') : '',
                to_date: values?.end_date ? dayjs(values?.end_date).format('YYYY-MM-DD') : '',
                customer: values.customer ? values?.customer?.value : '',
                completed: values.completed == 'Yes' ? true : values.completed == 'No' ? false : '',
            };

            const res: any = await Models.qoutation.filter(body, page);
            setState({
                qoutationList: res?.results,
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
                searchValue: values,
            });
            //  setDataSource(res?.data);
        } catch (error) {
            setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const onFinishFailed2 = (errorInfo: any) => {};

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
                        <div className="sale_report_inputs">
                            {/* <Form.Item label="Project Name" name="project_name" style={{ width: '200px' }}>
                                <Input />
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

                            <Form.Item label="From Date" name="start_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="end_date" style={{ width: '200px' }}>
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Quotations</h1>
                    </div>
                    <div>
                        {/* <Search placeholder="input search text" onChange={inputChange} enterButton className="search-bar" /> */}
                        <button type="button" className="create-button" onClick={() => showDrawer()}>
                            + Create Quotation
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.qoutationList}
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

                {state.qoutationList?.length > 0 && (
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

                <Drawer title="Create Quotation" placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic-form" layout="vertical" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off" form={form}>
                        {/* <Form.Item label="Customer Name" name="customer" required={false} rules={[{ required: true, message: 'Please select Customer Name!' }]}>
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
                        </Form.Item> */}

                        {/* <Form.Item label="Project Name" name="project_name" required={false} rules={[{ required: true, message: 'Please input your Project Name!' }]}>
                            <Input />
                        </Form.Item> */}
                        {/* Tax checkboxes */}
                        {/* <Form.Item label="Tax" name="taxes">
                            <Checkbox.Group value={Object.keys(checkedItems)}>
                                <div className="mt-4 flex items-center justify-between">
                                    {taxData?.map((item: any) => (
                                        <div key={item.id}>
                                            <Checkbox
                                                value={item.id}
                                                onChange={(e) => handleChange(e.target.checked ? [...Object.keys(checkedItems), item.id] : Object.keys(checkedItems).filter((id) => id !== item.id))}
                                                style={{ marginRight: '5px' }}
                                            >
                                                {item.tax_name}
                                            </Checkbox>
                                        </div>
                                    ))}
                                </div>
                            </Checkbox.Group>
                        </Form.Item> */}

                        <Form.Item label="Customer Name" name="customer_name" required={true} rules={[{ required: true, message: 'Please select Customer Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Address" name="address1" required={true} rules={[{ required: true, message: 'Please input your Address!' }]}>
                            <Input.TextArea rows={4} />
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

export default Quotations;
