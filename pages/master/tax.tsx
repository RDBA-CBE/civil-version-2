import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, Spin } from 'antd';
import { Button, Drawer, InputNumber } from 'antd';
import { Form, Input, Radio } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const Tax = () => {
    const [open, setOpen] = useState(false);
    const { Search } = Input;
    const [form] = Form.useForm();
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Tax');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [dataSource, setDataSource] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterData, setFilterData] = useState(dataSource);
    const [loading, setLoading] = useState(false);

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

    // get Tax datas
    useEffect(() => {
        GetTaxData();
    }, []);

    const GetTaxData = () => {
        const Token = localStorage.getItem('token');
        setLoading(true);

        axios
            .get(`${baseUrl}/tax_list/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setDataSource(res?.data);
                setFilterData(res.data);
                setLoading(false);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
                setLoading(false);
            });
    };

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Tax');
        } else {
            setDrawerTitle('Create Tax');
        }
    }, [editRecord, open]);

    // drawer
    const showDrawer = (record: any) => {
        if (record) {
            setEditRecord(record);
            form.setFieldsValue(record); // Set form values for editing
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

    // Table Datas
    const columns = [
        {
            title: 'Tax Name',
            dataIndex: 'tax_name',
            key: 'id',
            className: 'singleLineCell',
        },
        {
            title: 'Tax Percentage',
            dataIndex: 'tax_percentage',
            key: 'tax_percentage',
            className: 'singleLineCell',
        },
        {
            title: 'Tax Status',
            dataIndex: 'status',
            key: 'status',
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

    // const handleDelete = (record: any,) => {

    //   const Token = localStorage.getItem("token")

    //   Modal.confirm({
    //     title: "Are you sure, you want to delete this TAX record?",
    //     okText: "Yes",
    //     okType: "danger",
    //     onOk: () => {
    //       axios.delete(`${baseUrl}/delete_tax/${record.id}`, {
    //         headers: {
    //           "Authorization": `Token ${Token}`
    //         }
    //       }).then((res) => {
    //         console.log(res)
    //         GetTaxData()
    //       }).catch((err) => {
    //         console.log(err)
    //       })

    //     },
    //   });
    // };

    // Search Bar
    const inputChange = (e: any) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredData = dataSource.filter(
            (item: any) => item.tax_name.toLowerCase().includes(searchValue) || item.tax_percentage.includes(searchValue) || item.tax_status.toLowerCase().includes(searchValue)
        );
        setFilterData(searchValue ? filteredData : dataSource);
    };

    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_tax/${editRecord.id}/`, values, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res: any) => {
                    GetTaxData();
                    setOpen(false);
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });
        } else {
            axios
                .post(`${baseUrl}/create_tax/`, values, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res: any) => {
                    GetTaxData();
                    setOpen(false);
                })
                .catch((error: any) => {
                    if (error?.response?.status === 401) {
                        router.push('/');
                    }
                });

            form.resetFields();
        }
        onClose();
    };

    const onFinishFailed = (errorInfo: any) => {};

    type FieldType = {
        tax_name?: string;
        tax_percentage?: string;
        tax_status?: string;
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
                label: 'Tax Name:',
                value: viewRecord?.tax_name || 'N/A',
            },
            {
                label: 'Tax Percentage:',
                value: viewRecord?.tax_percentage || 'N/A',
            },
            {
                label: 'Tax Status:',
                value: viewRecord?.status || 'N/A',
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

    console.log('loading', loading);

    return (
        <>
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Tax</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" onChange={inputChange} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Tax
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={filterData}
                        columns={columns}
                        pagination={false}
                        scroll={scrollConfig}
                        loading={{
                            spinning: loading, // This enables the loading spinner
                            indicator: <Spin size="large"/>,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item<FieldType> label="Tax Name" name="tax_name" required={true} rules={[{ required: true, message: 'Tax Name field is required.' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Tax Percentage" name="tax_percentage" required={true} rules={[{ required: true, message: 'Tax Percentage field is required.' }]}>
                            <InputNumber style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Tax Status" name="tax_status" required={true} rules={[{ required: true, message: 'Tax Status field is required.' }]}>
                            <Radio.Group>
                                <Radio value="E"> Enable </Radio>
                                <Radio value="D"> Disable </Radio>
                            </Radio.Group>
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
                <Modal title="View Tax" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
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

export default Tax;
