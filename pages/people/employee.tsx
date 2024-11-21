import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, message, InputNumber, Spin } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input, Radio, DatePicker } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const Employee = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Employee');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [admin, setAdmin] = useState();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        const Admin: any = localStorage.getItem('admin');
        setAdmin(Admin);
    }, []);

    useEffect(() => {
        getEmployee();
    }, []);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Employee');
        } else {
            setDrawerTitle('Create Employee');
        }
    }, [editRecord, open]);

    const getEmployee = () => {
        const Token = localStorage.getItem('token');
        setLoading(true)
        axios
            .get(`${baseUrl}/employee_list/`, {
                headers: {
                    Authorization: `Token ${Token}`,
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
            const bodyData = {
                ...record,
                dob: dayjs(record.dob),
                joining_date: dayjs(record.joining_date),
            };
            setEditRecord(bodyData);
            form.setFieldsValue(bodyData);
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

    // table
    const columns = [
        {
            title: 'Employee Name',
            dataIndex: 'employee_name',
            key: 'employee_name',
            className: 'singleLineCell',
        },
        {
            title: 'User Name',
            dataIndex: 'username',
            key: 'username',
            className: 'singleLineCell',
        },

        {
            title: 'Mobile Number',
            dataIndex: 'mobile_number',
            key: 'mobile_number',
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

                    {/* <EditOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => showDrawer(record)}
                        className='edit-icon' rev={undefined} /> */}
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
    //     const Token = localStorage.getItem("token")

    //     Modal.confirm({
    //         title: "Are you sure, you want to delete this EMPLOYEE record?",
    //         okText: "Yes",
    //         okType: "danger",
    //         onOk: () => {
    //             console.log(record, "values")
    //             axios.delete(`${baseUrl}/delete_employee/${record.id}/`, {
    //                 headers:
    //                 {
    //                     "Authorization": `Token ${Token}`
    //                 }
    //             }).then((res) => {
    //                 console.log(res)
    //                 getEmployee()
    //             }).catch((err) => {
    //                 console.log(err)
    //             })

    //         },
    //     });
    // };

    // input search
    const [filterData, setFilterData] = useState(dataSource);

    const inputChange = (e: any) => {
        const SearchValue = e.target.value;

        const filteredData = dataSource.filter((item: any) => {
            return (
                item?.employee_name?.toLowerCase()?.includes(SearchValue?.toLowerCase()) ||
                item?.username?.toLowerCase()?.includes(SearchValue?.toLowerCase()) ||
                item?.mobile_number?.includes(SearchValue)
            );
        });
        setFilterData(filteredData);
    };

    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        const formattedData = {
            ...values,
            dob: dayjs(values.dob),
            joining_date: dayjs(values.joining_date),
        };

        // Check if editing or creating
        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_employee/${editRecord.id}/`, formattedData, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then((res) => {
                    form.resetFields();
                    getEmployee();
                    onClose();
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
                .post(`${baseUrl}/create_employee/`, formattedData, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res) => {
                    getEmployee();
                    form.resetFields();
                    onClose();
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    } else {
                        messageApi.open({
                            type: 'error',
                            content: `${error?.response?.data?.user?.username}`,
                        });
                    }
                });
        }
    };
    const onFinishFailed = (errorInfo: any) => {};

    type FieldType = {
        employee_name?: string;
        username?: string;
        password?: string;
        address?: string;
        mobile_number?: string;
        dob?: string;
        gender?: string;
        qualification?: string;
        joiningDate?: string;
        salary?: string;
        branch_email?: string;
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
                label: 'Employee Name:',
                value: viewRecord?.employee_name || 'N/A',
            },
            {
                label: 'User Name:',
                value: viewRecord?.username || 'N/A',
            },
            {
                label: 'Branch Email:',
                value: viewRecord?.branch_email || 'N/A',
            },
            {
                label: 'Date Of Birth:',
                value: formatDate(viewRecord?.dob) || 'N/A',
            },
            {
                label: 'Gender:',
                value: viewRecord?.gender_name || 'N/A',
            },
            {
                label: 'Mobile Number:',
                value: viewRecord?.mobile_number || 'N/A',
            },
            {
                label: 'Qualification:',
                value: viewRecord?.qualification || 'N/A',
            },
            {
                label: 'Salary:',
                value: viewRecord?.salary || 'N/A',
            },
            {
                label: 'Date Of Joining:',
                value: formatDate(viewRecord?.joining_date) || 'N/A',
            },
            {
                label: 'Address:',
                value: viewRecord?.address || 'N/A',
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
                {contextHolder}
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Employee Details</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" onChange={inputChange} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Employee{' '}
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
                        <Form.Item<FieldType> label="Employee Name" name="employee_name" required={true} rules={[{ required: true, message: 'Please input your Employee Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="User Name" name="username" required={true} rules={[{ required: true, message: 'Please input your User Name!' }]}>
                            <Input type="email" />
                        </Form.Item>

                        {drawerTitle === 'Create Employee' ? (
                            <Form.Item<FieldType> label="Password" name="password" required={true} rules={[{ required: true, message: 'Please input your Password!' }]}>
                                <Input.Password />
                            </Form.Item>
                        ) : (
                            <Form.Item<FieldType> label="Password" name="password" required={false} rules={[{ required: false, message: 'Please input your Password!' }]}>
                                <Input.Password />
                            </Form.Item>
                        )}

                        <Form.Item<FieldType> label="Address" name="address" required={true} rules={[{ required: true, message: 'Please input your Address!' }]}>
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Mobile Number" name="mobile_number" required={true} rules={[{ required: true, message: 'Please input your Mobile Number!' }]}>
                            <InputNumber style={{ width: '100%' }} maxLength={10} minLength={10} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Branch Email" name="branch_email" required={true} rules={[{ required: true, message: 'Please input your Branch Email!' }]}>
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item label="DOB" name="dob" required={true} rules={[{ required: true, message: 'Please Select your DOB!' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Gender" name="gender" required={true} rules={[{ required: true, message: 'Please Select your Gender!' }]}>
                            <Radio.Group>
                                <Radio value="M"> Male </Radio>
                                <Radio value="F"> Female </Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item<FieldType> label="Qualification" name="qualification" required={true} rules={[{ required: true, message: 'Please input your Qualification!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Joining Date" name="joining_date" required={true} rules={[{ required: true, message: 'Please input DOJ!' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        {admin === 'true' ? (
                            <Form.Item<FieldType> label="Salary" name="salary" required={false} rules={[{ required: false, message: 'Please input your Salary (Allowed Numbers Only 0-9)!' }]}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        ) : null}

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
                <Modal title="View Employee" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
                    {modalData().map((value: any, index: number) => (
                        <div className="content-main" key={index}>
                            {admin === 'true' || value.label !== 'Salary:' ? (
                                <>
                                    <p className="content-1">{value?.label}</p>
                                    <p className="content-2">{value?.value}</p>
                                </>
                            ) : null}
                        </div>
                    ))}
                </Modal>
            </div>
        </>
    );
};

export default Employee;
