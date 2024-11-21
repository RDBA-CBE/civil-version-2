import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Spin } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const Expense = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Expense');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [filterData, setFilterData] = useState(dataSource);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getExpense();
    }, []);

    const getExpense = () => {
        const Token = localStorage.getItem('token');
        setLoading(true)

        axios
            .get(`${baseUrl}/expense_list/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setDataSource(res.data);
                setFilterData(res.data);
                setLoading(false);
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
            setEditRecord(record);
            form.setFieldsValue(record);
            setDrawerTitle('Edit Expense Category');
        } else {
            setEditRecord(null);
            form.resetFields();
            setDrawerTitle('Create Expense Category');
        }
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Expense Name',
            dataIndex: 'expense_name',
            key: 'expense_name',
            className: 'singleLineCell',
        },
        {
            title: 'Created At',
            dataIndex: 'created_date',
            key: 'created_date',
            className: 'singleLineCell',
            render: (text: any) => {
                const formattedDate = moment(text, 'YYYY-MM-DD').isValid() ? moment(text).format('DD-MM-YYYY') : ''; // Empty string for invalid dates
                return formattedDate;
            },
        },
        {
            title: 'Actions',
            key: 'actions',
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
          {
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
          }

 */}
                </Space>
            ),
        },
    ];

    // const handleDelete = (record: any) => {
    //   // Implement your delete logic here
    //   const Token = localStorage.getItem("token")

    //   Modal.confirm({
    //     title: "Are you sure, you want to delete this EXPENSE record?",
    //     okText: "Yes",
    //     okType: "danger",
    //     onOk: () => {
    //       axios.delete(`${baseUrl}/delete_expense/${record.id}/`, {
    //         headers: {
    //           "Authorization": `Token ${Token}`
    //         }
    //       }).then((res) => {
    //         console.log(res)
    //         getExpense()
    //       }).catch((err) => {
    //         console.log(err)
    //       })

    //     },
    //   });
    // };

    const inputChange = (e: any) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredData = dataSource.filter((item: any) => item?.expense_name?.toLowerCase().includes(searchValue));
        setFilterData(searchValue ? filteredData : dataSource);
    };

    // form submit
    const onFinish = (values: any) => {
        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_expense/${editRecord.id}/`, values, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then((res) => {
                    getExpense();
                    setOpen(false);
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    } 
                });
        } else {
            axios
                .post(`${baseUrl}/create_expense/`, values, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then((res) => {
                    getExpense();
                    setOpen(false);
                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    } 
                });
        }
        form.resetFields();
    };

    const onFinishFailed = (errorInfo: any) => {
    };

    type FieldType = {
        expense_name?: string;
    };

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
                label: 'Expense Name:',
                value: viewRecord?.expense_name || 'N/A',
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
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Expense Category</h1>
                    </div>
                    <div>
                        <Search placeholder="input search text" onChange={inputChange} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Expense Category
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table dataSource={filterData} columns={columns} pagination={false} scroll={scrollConfig} 
                        loading={{
                            spinning: loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }} />
                </div>

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item<FieldType> label="Expense Name" name="expense_name" required={true} rules={[{ required: true, message: 'Please input your Expense Name!' }]}>
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
                <Modal title="View Expense" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
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

export default Expense;
