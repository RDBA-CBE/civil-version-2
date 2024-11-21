import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, InputNumber } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input, Select, Spin } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const Customer = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Employee Details');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [formFields, setFormFields] = useState<any>([]);
    const [filterData, setFilterData] = useState(dataSource);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getCustomer();
        getDropDownValues();
    }, []);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Customer');
        } else {
            setDrawerTitle('Create Customer');
        }
    }, [editRecord, open]);

    const getCustomer = () => {
        setLoading(true)
        axios
            .get(`${baseUrl}/customer_list/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setDataSource(res.data);
                setFilterData(res.data);
                setLoading(false)
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false)
            });
    };

    const getDropDownValues = () => {
        const Token = localStorage.getItem('token');
        axios
            .get(`${baseUrl}/create_customer/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setFormFields(res.data);
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    // Navigate to the home page
                    router.push('/');
                }
            });
    };

    const showModal = (record: any) => {
        setIsModalOpen(true);
        setViewRecord(record);
        modalData();
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    // drawer
    const showDrawer = (record: any) => {
        if (record) {
            const Token = localStorage.getItem('token');
            axios
                .get(`${baseUrl}/edit_customer/${record.id}/`, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res) => {
                    setEditRecord(record);
                    form.setFieldsValue(res.data);
                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        // Navigate to the home page
                        router.push('/');
                    }
                });
        } else {
            setEditRecord(null);
            form.resetFields();
        }

        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
    };

    // table heading
    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customer_name',
            key: 'customer_name',
            className: 'singleLineCell',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone_no',
            key: 'phone_no',
            className: 'singleLineCell',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            className: 'singleLineCell',
        },
        {
            title: 'Actions',
            key: 'actions',
            className: 'singleLineCell',
            render: (text: any, record: any) => (
                <Space size="middle">
                    <EyeOutlined style={{ cursor: 'pointer' }} onClick={() => showModal(record)} className="view-icon" rev={undefined} />

                    {localStorage.getItem('admin') === 'true' ? (
                        <EditOutlined style={{ cursor: 'pointer' }} onClick={() => showDrawer(record)} className="edit-icon" rev={undefined} />
                    ) : (
                        <EditOutlined style={{ cursor: 'pointer', display: 'none' }} onClick={() => showDrawer(record)} className="edit-icon" rev={undefined} />
                    )}

                    {/* {
                        localStorage.getItem('admin') === 'true' ? (
                            <DeleteOutlined
                                style={{ color: "red", cursor: "pointer" }}
                                onClick={() => handleDelete(record)}
                                className='delete-icon'
                                rev={undefined}
                            />
                        ) : (
                            <DeleteOutlined
                                style={{ display: "none" }}
                                onClick={() => handleDelete(record)}
                                className='delete-icon'
                                rev={undefined}
                            />
                        )
                    } */}
                </Space>
            ),
        },
    ];

    // const handleDelete = (record: any) => {
    //     // Implement your delete logic here
    //     Modal.confirm({
    //         title: "Are you sure, you want to delete this CUSTOMER record?",
    //         okText: "Yes",
    //         okType: "danger",
    //         onOk: () => {

    //             axios.delete(`${baseUrl}/delete_customer/${record.id}`, {
    //                 headers: {
    //                     "Authorization": `Token ${localStorage.getItem("token")}`
    //                 }
    //             }).then((res) => {
    //                 messageApi.open({
    //                     type: 'success',
    //                     content: 'Deleted Successfully..!',
    //                 });
    //                 console.log(res);
    //                 getCustomer();
    //             }).catch((err) => {
    //                 console.log(err);
    //             });

    //         },
    //     });
    // };

    const inputChange = (e: any) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredData = dataSource.filter(
            (item: any) => item.customer_name.toLowerCase().includes(searchValue) || item.phone_no.toLowerCase().includes(searchValue) || item.email.toLowerCase().includes(searchValue)
        );
        setFilterData(searchValue ? filteredData : dataSource);
    };

    // form submit
    const onFinish = (values: any) => {
        // Check if editing or creating
        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_customer/${editRecord.id}/`, values, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then((res) => {
                    form.resetFields();
                    getCustomer();
                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });
            // Clear editRecord state
            setEditRecord(null);
        } else {
            axios
                .post(`${baseUrl}/create_customer/`, values, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then((res) => {
                    form.resetFields();
                    getCustomer();
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });
        }
        onClose();
    };
    const onFinishFailed = (errorInfo: any) => {};

    type FieldType = {
        customer_name?: string;
        phone_no?: string;
        gstin_no?: string;
        email?: string;
        address1?: string;
        city1?: string;
        state1?: string;
        country1?: string;
        pincode1?: string;
        contact_person1?: string;
        mobile_no1?: string;
        contact_person_email1?: string;
        code?: string;
        place_of_testing?: string;
        address2?: string;
        city2?: string;
        state2?: string;
        country2?: string;
        pincode2?: string;
        contact_person2?: string;
        mobile_no2?: string;
        contact_person_email2?: string;
    };

    const { TextArea } = Input;

    // modal data
    const modalData = () => {
        const formatDate = (dateString: any) => {
            if (!dateString) {
                return 'N/A'; // or handle it according to your requirements
            }

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return 'Invalid Date'; // or handle it according to your requirements
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        };

        const data = [
            {
                label: 'Customer Name:',
                value: viewRecord?.customer_name || 'N/A',
            },
            {
                label: 'phone No:',
                value: viewRecord?.phone_no || 'N/A',
            },
            {
                label: 'gstin No:',
                value: viewRecord?.gstin_no || 'N/A',
            },
            {
                label: 'email:',
                value: viewRecord?.email || 'N/A',
            },

            {
                label: 'Address 1:',
                value: viewRecord?.address1 || 'N/A',
            },
            {
                label: 'City 1:',
                value: viewRecord?.city1 || 'N/A',
            },
            {
                label: 'State 1:',
                value: viewRecord?.state1 || 'N/A',
            },
            {
                label: 'Country 1:',
                value: viewRecord?.country1 || 'N/A',
            },

            {
                label: 'Pincode 1:',
                value: viewRecord?.pincode1 || 'N/A',
            },
            {
                label: 'Address 2:',
                value: viewRecord?.address2 || 'N/A',
            },

            {
                label: 'City 2:',
                value: viewRecord?.city2 || 'N/A',
            },
            {
                label: 'State 2:',
                value: viewRecord?.state2 || 'N/A',
            },
            {
                label: 'Country 2:',
                value: viewRecord?.country2 || 'N/A',
            },
            {
                label: 'Pincode 2:',
                value: viewRecord?.pincode2 || 'N/A',
            },
            {
                label: 'contact Person 1:',
                value: viewRecord?.contact_person1 || 'N/A',
            },
            {
                label: 'mobile No 1 :',
                value: viewRecord?.mobile_no1 || 'N/A',
            },
            {
                label: 'contact_person Email 1:',
                value: viewRecord?.contact_person_email1 || 'N/A',
            },
            {
                label: 'contact Person 2:',
                value: viewRecord?.contact_person2 || 'N/A',
            },

            {
                label: 'mobile No 2:',
                value: viewRecord?.mobile_no2 || 'N/A',
            },

            {
                label: 'contact Person Email 2:',
                value: viewRecord?.contact_person2 || 'N/A',
            },
            {
                label: 'place Of Testing :',
                value: viewRecord?.place_of_testing || 'N/A',
            },
            {
                label: 'Created By:',
                value: viewRecord?.created_by || 'N/A',
            },
            {
                label: 'Created Date:',
                value: formatDate(viewRecord?.created_date),
            },
            {
                label: 'Modified By:',
                value: viewRecord?.modified_by || 'N/A',
            },
            {
                label: 'Modified Date:',
                value: formatDate(viewRecord?.modified_date),
            },
        ];

        return data;
    };

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    return (
        <>
            <div className="panel ">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Customer Details</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" onChange={inputChange} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Customer
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table dataSource={filterData} columns={columns} scroll={scrollConfig} 
                      loading={{
                        spinning: loading, // This enables the loading spinner
                        indicator: <Spin size="large"/>,
                        tip: 'Loading data...', // Custom text to show while loading
                    }}/>
                </div>

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item<FieldType> label="Customer Name" name="customer_name" required={true} rules={[{ required: true, message: 'Please input your Customer Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Phone Number" name="phone_no" required={true} rules={[{ required: true, message: 'Please input your Phone Number!' }]}>
                            <InputNumber minLength={10} maxLength={10} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType> label="GST in" name="gstin_no" required={true} rules={[{ required: true, message: 'Please input your GST in!' }]}>
                            <Input maxLength={15} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Email" name="email" required={true} rules={[{ required: true, message: 'Please input your EMail!' }]}>
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item<FieldType> label="Address 1" name="address1" required={true} rules={[{ required: true, message: 'Please input your Address1!' }]}>
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item<FieldType> label="City 1" name="city1" required={true} rules={[{ required: true, message: 'Please input your City 1!' }]}>
                            <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.city1?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item<FieldType> label="State 1" name="state1" required={true} rules={[{ required: true, message: 'Please input your State 1!' }]}>
                            <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.state1?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item<FieldType> label="Country 1" name="country1" required={true} rules={[{ required: true, message: 'Please input your Country 1!' }]}>
                            <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.country1?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item<FieldType> label="Pincode 1" name="pincode1" required={true} rules={[{ required: true, message: 'Please input your Pincode 1!' }]}>
                            <InputNumber maxLength={6} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Address 2" name="address2" required={false} rules={[{ required: false, message: 'Please input your Address 2!' }]}>
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item<FieldType> label="City 2" name="city2" required={false} rules={[{ required: false, message: 'Please input your City 2!' }]}>
                            <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.city2?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item<FieldType> label="State 2" name="state2" required={false} rules={[{ required: false, message: 'Please input your State 2!' }]}>
                            <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.state2?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item<FieldType> label="Country 2" name="country2" required={false} rules={[{ required: false, message: 'Please input your Country 2!' }]}>
                            <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.country2?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item<FieldType> label="Pincode 2" name="pincode2" required={false} rules={[{ required: false, message: 'Please input your Pincode 2!' }]}>
                            <InputNumber maxLength={6} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Contact Person 1" name="contact_person1" required={false} rules={[{ required: false, message: 'Please input your Contact Person 1!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Mobile Number 1" name="mobile_no1" required={false} rules={[{ required: false, message: 'Please input your Mobile Number 1!' }]}>
                            <InputNumber maxLength={10} minLength={10} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Contact Person Email1"
                            name="contact_person_email1"
                            required={false}
                            rules={[{ required: false, message: 'Please input your Contact Person Email 1!' }]}
                        >
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item<FieldType> label="Contact Person 2" name="contact_person2" required={false} rules={[{ required: false, message: 'Please input your Contact Person 2!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Mobile Number 2" name="mobile_no2" required={false} rules={[{ required: false, message: 'Please input your Mobile Number 2!' }]}>
                            <InputNumber maxLength={10} minLength={10} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Contact Person Email2"
                            name="contact_person_email2"
                            required={false}
                            rules={[{ required: false, message: 'Please input your Contact Person Email2!' }]}
                        >
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item<FieldType> label="Place Of Testing" name="place_of_testing" required={false} rules={[{ required: false, message: 'Please input your Place Of Testing!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item>
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
                        </Form.Item>
                    </Form>
                </Drawer>

                {/* modal */}
                <Modal title="View Customer" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
                    {modalData()?.map((value: any) => {
                        return (
                            <>
                                <div className="content-main">
                                    <p className="content-1">{value?.label}</p>
                                    <p className="content-2">{value?.value}</p>
                                </div>
                            </>
                        );
                    })}
                </Modal>
            </div>
        </>
    );
};

export default Customer;
