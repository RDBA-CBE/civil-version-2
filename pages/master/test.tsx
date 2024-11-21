import React, { useEffect, useState } from 'react';
import { Space, Table, Modal } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input, InputNumber, Select, Spin } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const Test = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawertitle, setDrawerTitle] = useState('Create Test');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [formFields, setFormFields] = useState<any>([]);
    const [filterData, setFilterData] = useState(dataSource);
    const [loading, setLoading] = useState(false);

    // get test
    useEffect(() => {
        getTest();
    }, []);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Test');
        } else {
            setDrawerTitle('Create Test');
        }
    });

    useEffect(() => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/create_test/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setFormFields(res.data);
            })
            .catch((error) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });
    }, []);

    const getTest = () => {
        const Token = localStorage.getItem('token');
        setLoading(true);

        axios
            .get(`${baseUrl}/test_list/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res.data);
                setFilterData(res.data);
                setLoading(false);
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
                setLoading(false);
            });
    };

    const showModal = (record: any) => {
        const testRecord = {
            material_name: record?.material_name,
            test_name: record.test_name,
            price_per_piece: record.price_per_piece,
            id: record.id,
            created_by: record.created_by,
            created_date: record.created_date,
            modified_by: record.modified_by,
            modified_date: record.modified_date,
        };

        setIsModalOpen(true);
        setViewRecord(testRecord);
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
            const testRecord: any = {
                material_name: record.material_id.toString(),
                test_name: record.test_name,
                price_per_piece: record.price_per_piece,
                id: record.id,
            };

            setEditRecord(testRecord);
            form.setFieldsValue(testRecord);
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
            title: 'Test Name',
            dataIndex: 'test_name',
            key: 'test_name',
            className: 'singleLineCell',
        },
        {
            title: 'Material Name',
            dataIndex: 'material_name',
            key: 'material_name',
            className: 'singleLineCell',
        },
        {
            title: 'Price',
            dataIndex: 'price_per_piece',
            key: 'price_per_piece',
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
                    } */}
                </Space>
            ),
        },
    ];

    // const handleDelete = (record: any) => {
    //     // Implement your delete logic here
    //     const Token = localStorage.getItem("token")

    //     Modal.confirm({
    //         title: "Are you sure, you want to delete this TEST record?",
    //         okText: "Yes",
    //         okType: "danger",
    //         onOk: () => {
    //             axios.delete(`${baseUrl}/delete_test/${record.id}/`,
    //                 {
    //                     headers: {
    //                         "Authorization": `Token ${Token}`
    //                     }
    //                 }).then((res) => {
    //                     console.log(res)
    //                     getTest()
    //                 }).catch((err) => {
    //                     console.log(err)
    //                 })

    //         },

    //     });
    // };

    const inputChange = (e: any) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredData = dataSource.filter(
            (item: any) => item.test_name.toLowerCase().includes(searchValue) || item.material_name.toLowerCase().includes(searchValue) || item.price_per_piece.includes(searchValue)
        );
        setFilterData(searchValue ? filteredData : dataSource);
    };

    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');

        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_test/${editRecord.id}/`, values, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res: any) => {
                    getTest();
                    setOpen(false);
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });
        } else {
            axios
                .post(`${baseUrl}/create_test/`, values, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then((res) => {
                    getTest();
                    setOpen(false);
                    form.resetFields();
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

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
                label: 'Test Name:',
                value: viewRecord?.test_name || 'N/A',
            },
            {
                label: 'Material Name:',
                value: viewRecord?.material_name || 'N/A',
            },
            {
                label: 'price Per Piece:',
                value: viewRecord?.price_per_piece || 'N/A',
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Test</h1>
                    </div>
                    <div>
                        <Search placeholder="input search text" onChange={inputChange} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Test
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={filterData}
                        columns={columns}
                        scroll={scrollConfig}
                        loading={{
                            spinning: loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>

                <Drawer title={drawertitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item label="Material Name" name="material_name" required={true} rules={[{ required: true, message: 'Please Select your Material Name!' }]}>
                            <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.materials?.map((val: any) => (
                                    <Select.Option key={val.id} value={val.material_id}>
                                        {val.material_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Test Name" name="test_name" required={true} rules={[{ required: true, message: 'Please input your Test Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Price" name="price_per_piece" required={true} rules={[{ required: true, message: 'Please input your Testing Price!' }]}>
                            <InputNumber style={{ width: '100%' }} />
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
                <Modal title="View Test" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
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

export default Test;
