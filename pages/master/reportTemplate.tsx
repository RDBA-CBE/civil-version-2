import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Form, Input, Select, Button, Drawer } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';
import { baseUrl } from '@/utils/function.util';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const Report = () => {
    const [open, setOpen] = useState(false);
    const { Search } = Input;
    const [form] = Form.useForm();
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Report Templates');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formFields, setFormFields] = useState<any>([]);
    const [dataSource, setDataSource] = useState([]);
    const [editor, setEditor] = useState('');
    const [filterData, setFilterData] = useState(dataSource);

    // get Method
    useEffect(() => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/create_report_template/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setFormFields(res?.data);
            })
            .catch((error: any) => {});
    }, []);

    // Get Method
    useEffect(() => {
        getTemplate();
    }, []);

    const getTemplate = () => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/report_template_list/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setDataSource(res.data);
                setFilterData(res.data);
            })
            .catch((error: any) => {});
    };

    // editor
    const handleEditorChange = (value: any) => {
        setEditor(value);
    };

    // drawer
    const showDrawer = (record: any) => {
        if (record) {
            const templateRecord: any = {
                material: record.material.id,
                report_template_name: record.report_template_name,
                print_format: record?.print_format.id,
                letter_pad_logo: record?.letter_pad_logo.id,
                template: record?.template,
                id: record?.id,
            };
            setEditor(record?.template);
            setEditRecord(templateRecord);
            form.setFieldsValue(templateRecord);
            setDrawerTitle('Edit Report Templates');
            // setEditor(templateRecord)
        } else {
            setEditRecord(null);
            form.resetFields();
            setDrawerTitle('Create Report Templates');
        }
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
    };

    // modal
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

    // Table Header
    const columns = [
        {
            title: 'Report Name',
            dataIndex: 'report_template_name',
            key: 'report_template_name',
        },
        {
            title: 'Material Name',
            dataIndex: 'material',
            key: 'material',
            render: (material: any) => (material && material.name) || 'N/A',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (text: any, record: any) => (
                <Space size="middle">
                    <EyeOutlined style={{ cursor: 'pointer' }} onClick={() => showModal(record)} className="view-icon" rev={undefined} />
                    <EditOutlined style={{ cursor: 'pointer' }} onClick={() => showDrawer(record)} className="edit-icon" rev={undefined} />
                    <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDelete(record)} className="delete-icon" rev={undefined} />
                </Space>
            ),
        },
    ];

    const handleDelete = (record: any) => {
        // Implement your delete logic here

        Modal.confirm({
            title: 'Are you sure, you want to delete this REPORT TEMPLATES record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                axios
                    .delete(`${baseUrl}/delete_report_template/${record?.id}/`, {
                        headers: {
                            Authorization: `Token ${localStorage.getItem('token')}`,
                        },
                    })
                    .then((res) => {
                        getTemplate();
                    })
                    .catch((err) => {});
            },
        });
    };

    const inputChange = (e: any) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredData = dataSource.filter((item: any) => item?.report_template_name?.toLowerCase().includes(searchValue));
        setFilterData(searchValue ? filteredData : dataSource);
    };

    // form submit
    const onFinish = (values: any) => {
        const templateText = values?.template;

        const body = {
            material: values.material,
            report_template_name: values.report_template_name,
            print_format: values.print_format,
            letter_pad_logo: values.letter_pad_logo,
            template: templateText,
        };

        const Token = localStorage.getItem('token');

        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_report_template/${editRecord.id}/`, body, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res) => {
                    setOpen(false);
                    getTemplate();
                })
                .catch((error) => {});
        } else {
            axios
                .post(`${baseUrl}/create_report_template/`, body, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res) => {
                    form.resetFields();
                    setOpen(false);
                    getTemplate();
                })
                .catch((error) => {});
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

    // modal data
    const modalData = () => {
        const data: any = [
            {
                label: 'Report Template Name:',
                value: viewRecord?.report_template_name || 'N/A',
            },
            {
                label: 'Material Name:',
                value: viewRecord?.material.name || 'N/A',
            },
            {
                label: 'Templates:',
                value: viewRecord?.template,
            },
            {
                label: 'Print Format:',
                value: viewRecord?.print_format.name || 'N/A',
            },
            {
                label: 'letter Pad Logo:',
                value: viewRecord?.letter_pad_logo.name || 'N/A',
            },
        ];

        return data;
    };

    return (
        <>
            <div>
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Report Templates</h1>
                    </div>
                    <div>
                        <Search placeholder="input search text" onChange={inputChange} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Report
                        </button>
                    </div>
                </div>
                <div>
                    <Table dataSource={filterData} columns={columns} pagination={false} />
                </div>

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item label="Material Name" name="material" required={false} rules={[{ required: true, message: 'Please select Material Name!' }]}>
                            <Select>
                                {formFields?.materials?.map((val: any) => (
                                    <Select.Option key={val.material_name} value={val.id}>
                                        {val.material_name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Report Name" name="report_template_name" required={false} rules={[{ required: true, message: 'Please input your Report Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Templates" name="template" required={false} rules={[{ required: true, message: 'Please input your Report Templates!' }]}>
                            <ReactQuill
                                value={editor}
                                onChange={handleEditorChange}
                                modules={{
                                    toolbar: [
                                        [{ header: [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        ['blockquote', 'code-block'],
                                        [{ list: 'ordered' }, { list: 'bullet' }],
                                        ['link', 'image', 'video'],
                                        ['clean'],
                                    ],
                                }}
                            />
                        </Form.Item>

                        <Form.Item label="Print Format" name="print_format" required={false} rules={[{ required: true, message: 'Please Select your Print Format!' }]}>
                            <Select>
                                {formFields?.print_format?.map((val: any) => {
                                    return <Select.Option value={val.id}>{val.name}</Select.Option>;
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Letter Pad Logo" name="letter_pad_logo" required={false} rules={[{ required: true, message: 'Please Select your Letter Pad Logo!' }]}>
                            <Select>
                                {formFields?.letter_pad_logo?.map((val: any) => {
                                    return <Select.Option value={val?.id}>{val?.name}</Select.Option>;
                                })}
                            </Select>
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
                <Modal title="View Report Template" width={900} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
                    {modalData()?.map((value: any) => {
                        return (
                            <>
                                <div className="content-main">
                                    <p className="content-1">{value?.label}</p>
                                    <p className="content-2" dangerouslySetInnerHTML={{ __html: value?.value }}></p>
                                </div>
                            </>
                        );
                    })}
                </Modal>
            </div>
        </>
    );
};

export default Report;
