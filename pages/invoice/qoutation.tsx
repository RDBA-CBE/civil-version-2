import React, { useState, useEffect } from 'react';
import { DatePicker, Space, Table, Spin, Button, Drawer, Form, Input, Select, Checkbox } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import dayjs from 'dayjs';
import { baseUrl } from '@/utils/function.util';

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
        axios
            .get(`${baseUrl}/create_invoice/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                console.log('✌️res --->', res);
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

    console.log('formField', formFields);
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
                    {/* <DeleteOutlined
                        style={{ color: "red", cursor: "pointer" }}
                        onClick={() => handleDelete(record)} className='delete-icon' rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    const handleEditClick = (record: any) => {
        // Navigate to the /invoice/edit page with the record data as a query parameter
        window.location.href = `/invoice/editQoutation?id=${record.id}`;
    };

    // form submit
    const onFinish = (values: any) => {
        console.log('✌️values --->', values);
        const Token = localStorage.getItem('token');

        axios
            .post(`${baseUrl}/customers/`, values, {
                headers: { Authorization: `Token ${Token}` },
            })
            .then((res) => {
                console.log('✌️res --->', res);
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
                console.log('✌️res --->', res);
                initialData();
                window.location.href = `/invoice/editQoutation?id=${res?.data?.id}`;
                setOpen(false);
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
    };

    const onFinishFailed = (errorInfo: any) => {};

    const handleSelectChange = (customerId: any) => {
        const selectedCustomer = formFields?.customer?.find((customer: any) => customer.id === customerId);

        setSelectedCustomerId(customerId);
        setCustomerAddress(selectedCustomer?.address1 || '');
    };

    // Handle checkbox changes
    // const handleChange = (checkedValues: any) => {
    //     const updatedCheckedItems: any = { ...checkedItems };
    //     checkedValues.forEach((id: any) => {
    //         updatedCheckedItems[id] = true; // Mark as checked
    //     });
    //     Object.keys(updatedCheckedItems).forEach((id) => {
    //         if (!checkedValues.includes(id)) {
    //             delete updatedCheckedItems[id]; // Uncheck if it's not in the selected values
    //         }
    //     });
    //     setCheckedItems(updatedCheckedItems);
    // };

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    // search

    useEffect(() => {
        initialData();
        // TaxList();
    }, []);

    const initialData = () => {
        const Token = localStorage.getItem('token');
        console.log('✌️Token --->', Token);
        setLoading(true);
        const body = {
            // project_name: '',
            start_date: '',
            end_date: '',
            customer: '',
            completed: '',
        };

        console.log('✌️body --->', body);

        axios
            .get(`${baseUrl}/quotations/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
                params: { ...body },
            })
            .then((res: any) => {
                console.log('✌️res --->', res);
                setDataSource(res?.data);
                setLoading(false);
            })
            .catch((error: any) => {
                if (error.response?.status === 401) {
                    router.push('/');
                }
                setLoading(false);
            });
    };

    // const TaxList = () => {
    //     const Token = localStorage.getItem('token');
    //     axios
    //         .get(`${baseUrl}/enable_tax_list/`, {
    //             headers: {
    //                 Authorization: `Token ${Token}`,
    //             },
    //         })
    //         .then((res) => {
    //             console.log('✌️res --->', res);
    //             setTaxData(res?.data);
    //         })
    //         .catch((error: any) => {
    //             if (error.response?.status === 401) {
    //                 router.push('/');
    //             }
    //         });
    // };

    // form submit
    const onFinish2 = (values: any) => {
        console.log('✌️values --->', values);
        const Token = localStorage.getItem('token');

        const body = {
            // project_name: values.project_name ? values.project_name : '',
            start_date: values?.start_date ? dayjs(values?.start_date).format('YYYY-MM-DD') : '',
            end_date: values?.end_date ? dayjs(values?.end_date).format('YYYY-MM-DD') : '',
            customer: values.customer ? values.customer : '',
            completed: values.completed == 'Yes' ? true : values.completed == 'No' ? false : '',
        };

        console.log('✌️body --->', body);

        axios
            .get(`${baseUrl}/quotations/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
                params: { ...body },
            })
            .then((res: any) => {
                console.log('✌️res --->', res);
                setDataSource(res?.data);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
        form.resetFields();
    };

    const onFinishFailed2 = (errorInfo: any) => {};

    // console.log('taxData', taxData);

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
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {formFields?.customer?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.customer_name}
                                        </Select.Option>
                                    ))}
                                </Select>
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

                            <div style={{ display: 'flex', alignItems: 'end' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '150px' }}>
                                        Search
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
                        dataSource={dataSource}
                        columns={columns}
                        pagination={false}
                        scroll={scrollConfig}
                        loading={{
                            spinning: loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>

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
