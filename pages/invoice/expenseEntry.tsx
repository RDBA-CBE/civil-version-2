import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, InputNumber, Button, Drawer, Form, Input, Select, DatePicker, Spin } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const ExpenseEntry = () => {
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Expense');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [dataSource, setDataSource] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formFields, setFormFields] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios
            .get(`${baseUrl}/create_expense_entry/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setFormFields(res.data);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                } else {
                }
            });
    }, []);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Expense');
        } else {
            setDrawerTitle('Create Expense');
        }
    }, [editRecord, open]);

    // Model
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
            const updateData: any = {
                amount: record.amount,
                date: dayjs(record?.date),
                expense_category: record.expense_category,
                expense_user: record.expense_user,
                id: record.id,
                narration: record.narration,
            };
            setEditRecord(updateData);
            form.setFieldsValue(updateData); // Set form values for editing
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

    const columns = [
        {
            title: 'Expense User',
            dataIndex: 'expense_user',
            key: 'expense_user',
            className: 'singleLineCell',
        },
        {
            title: 'Expense Category',
            dataIndex: 'expense_category_name',
            key: 'expense_category_name',
            className: 'singleLineCell',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
            className: 'singleLineCell',
        },
        {
            title: 'Narration',
            dataIndex: 'narration',
            key: 'narration',
            className: 'singleLineCell',
        },
        {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
            className: 'singleLineCell',
            render: (text: any, record: any) => {
                return dayjs(text).format('DD-MM-YYYY');
            },
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
            className='edit-icon' rev={undefined} />
          <DeleteOutlined
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => handleDelete(record)} className='delete-icon' rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    // const handleDelete = (record: any,) => {

    //   const Token = localStorage.getItem("token")

    //   Modal.confirm({
    //     title: "Are you sure, you want to delete this EXPENSE ENTRY record?",
    //     okText: "Yes",
    //     okType: "danger",
    //     onOk: () => {
    //       axios.delete(`${baseUrl}/delete_expense_entry/${record.id}`, {
    //         headers: {
    //           "Authorization": `Token ${Token}`
    //         }
    //       }).then((res) => {
    //         console.log(res)
    //         getExpenceEntry()
    //       }).catch((err) => {
    //         console.log(err)
    //       })

    //     },
    //   });
    // };

    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        const formattedData = {
            ...values,
            expense_user: values.expense_user,
            date: dayjs(values.date), // Updated date formatting
            expense_category: values.expense_category,
            amount: values.amount,
            narration: values.narration,
        };

        // Check if editing or creating
        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_expense_entry/${editRecord.id}/`, formattedData, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res: any) => {
                    initialData();
                    setOpen(false);
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    } else {
                    }
                });
        } else {
            axios
                .post(`${baseUrl}/create_expense_entry/`, formattedData, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res: any) => {
                    initialData();
                    setOpen(false);
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    } else {
                    }
                });
            form.resetFields();
        }
        onClose();
    };

    const onFinishFailed = (errorInfo: any) => {};

    type FieldType = {
        expense_user?: string;
        expense_category?: string;
        amount?: string;
        narration?: string;
        date?: string;
    };

    // Model Data
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
                label: 'Expense User:',
                value: viewRecord?.expense_user || 'N/A',
            },
            {
                label: 'Expense Category:',
                value: viewRecord?.expense_category_name || 'N/A',
            },
            {
                label: 'Amount:',
                value: viewRecord?.amount || 'N/A',
            },
            {
                label: 'Narration:',
                value: viewRecord?.narration || 'N/A',
            },
            {
                label: 'Date:',
                value: formatDate(viewRecord?.date),
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

    // search

    useEffect(() => {
        initialData();
    }, []);

    const initialData = () => {
        const Token = localStorage.getItem('token');
        setLoading(true);
        const body = {
            from_date: '',
            to_date: '',
            expense_user: '',
            expense_category: '',
        };

        axios
            .post(`${baseUrl}/expense_entry_list/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res?.data);
                setLoading(false);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false);
            });
    };

    // form submit
    const onFinish2 = (values: any) => {
        const Token = localStorage.getItem('token');

        const body = {
            from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
            to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
            expense_user: values.expense_user ? values.expense_user : '',
            expense_category: values.expense_category ? values.expense_category : '',
        };

        axios
            .post(`${baseUrl}/expense_entry_list/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res?.data);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
        form.resetFields();
    };

    const onFinishFailed2 = (errorInfo: any) => {};

    return (
        <>
            <div className="panel">
                <div>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish2} onFinishFailed={onFinishFailed2} autoComplete="off">
                        <div className="sale_report_inputs">
                            <Form.Item label="Expense User" name="expense_user" style={{ width: '250px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Expense Category" name="expense_category" style={{ width: '300px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {formFields?.expense?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.expense_name}
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
                                    <Button type="primary" htmlType="submit" style={{ width: '200px' }}>
                                        Search
                                    </Button>
                                </Form.Item>
                            </div>
                        </div>
                    </Form>
                </div>
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Expense Entry</h1>
                    </div>
                    <div>
                        {/* <Search placeholder="Input search text" onChange={inputChange} enterButton className="search-bar" /> */}
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Expense Entry
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

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item label="Expense User" name="expense_user" required={true} rules={[{ required: true, message: 'Expense User field is required.' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Expense Category" name="expense_category" required={true} rules={[{ required: true, message: 'Expense Category field is required.' }]}>
                            <Select placeholder="Select a expense category">
                                {formFields?.expense?.map((val: any) => (
                                    <Select.Option key={val.id} value={val.id}>
                                        {val.expense_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item<FieldType> label="Amount" name="amount" required={true} rules={[{ required: true, message: 'Amount field is required.' }]}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Narration" name="narration" required={true} rules={[{ required: true, message: 'Narration field is required' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Date" name="date" required={true} rules={[{ required: true, message: 'Please Select your Expense Entry Date!' }]}>
                            <DatePicker style={{ width: '100%' }} />
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

                {/* Modal */}
                <Modal title="View Expense Entry" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
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

export default ExpenseEntry;
