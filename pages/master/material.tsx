import React, { useEffect, useState, useRef } from 'react';
import { Space, Table, Modal, Select, Spin } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';
import router from 'next/router';
import { baseUrl } from '@/utils/function.util';

const Material = () => {
    const editorRef: any = useRef();
    const { Search } = Input;
    const [form] = Form.useForm();

    const [editorLoaded, setEditorLoaded] = useState(false);
    const { CKEditor, ClassicEditor } = editorRef.current || {};
    const [open, setOpen] = useState(false);
    const [DrawerTitle, setDrawerTitle] = useState('Create Material');
    const [editRecord, setEditRecord] = useState<any>(null);
    const [dataSource, setDataSource] = useState([]);
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editor, setEditor] = useState<any>('');
    const [formFields, setFormFields] = useState<any>([]);
    const [loading, setLoading] = useState(false);

    // Get Material Data
    useEffect(() => {
        getMaterial();
        getDropDown();
    }, []);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Material');
        } else {
            setDrawerTitle('Create Material');
        }
    }, [editRecord]);

    useEffect(() => {
        editorRef.current = {
            CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
            ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
        };
        setEditorLoaded(true);
    }, []);

    const getMaterial = () => {
        const Token = localStorage.getItem('token');
        setLoading(true);

        axios
            .get(`${baseUrl}/material_list/`, {
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
                if (error.response.status === 401) {
                    router.push('/');
                } 
                setLoading(false);
            });
    };

    const getDropDown = () => {
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
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                } 
            });
    };

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

    const handleEditorChange = (data: any) => {
        setEditor(data);
    };

    // drawer
    const showDrawer = (record: any) => {
        if (record) {
            setEditRecord(record);
            form.setFieldsValue(record);
            setEditor(record.template);
        } else {
            setEditRecord(null);
            form.resetFields();
            setEditor(null);
        }
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Material Name',
            dataIndex: 'material_name',
            key: 'material_name',
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
    //   // Implement your delete logic here
    //   const Token = localStorage.getItem("token")
    //   console.log("TokenTokenTokenToken", Token)

    //   Modal.confirm({
    //     title: "Are you sure, you want to delete this MATERIAL record?",
    //     okText: "Yes",
    //     okType: "danger",
    //     onOk: () => {
    //       console.log("values", record)
    //       axios.delete(`${baseUrl}/delete_material/${record.id}`, {
    //         headers: {
    //           "Authorization": `Token ${Token}`
    //         }
    //       }).then((res) => {
    //         console.log(res)
    //         getMaterial()
    //       }).catch((err) => {
    //         console.log(err)
    //       })

    //     },

    //   });
    // };

    const [filterData, setFilterData] = useState(dataSource);

    const inputChange = (e: any) => {
        const searchValue = e.target.value.toLowerCase();
        const filteredData = dataSource.filter((item: any) => item?.material_name?.toLowerCase().includes(searchValue) || item?.created_date?.includes(searchValue));
        setFilterData(searchValue ? filteredData : dataSource);
    };

    // form submit
    const onFinish = (values: any) => {

        const Token = localStorage.getItem('token');

        const body = {
            template: editor,
            material_name: values.material_name,
            letter_pad_logo: values.letter_pad_logo,
            print_format: values.print_format,
        };

        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_material/${editRecord.id}/`, body, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res: any) => {
                    getMaterial();
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    } 
                });
        } else {
            axios
                .post(`${baseUrl}/create_material/`, body, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res: any) => {
                    getMaterial();
                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });

            form.resetFields();
        }
        onClose();
    };

    const onFinishFailed = (errorInfo: any) => {
    };

    type FieldType = {
        material_name?: string;
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
                label: 'Material Name:',
                value: viewRecord?.material_name || 'N/A',
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
                value: formatDate(viewRecord?.modified_date) || 'N/A',
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Material</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" onChange={inputChange} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Material
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

                <Drawer title={DrawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item<FieldType> label="Material Name" name="material_name" required={true} rules={[{ required: true, message: 'Material Name field is required' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Templates" name="template" required={false} rules={[{ required: false, message: 'Template field is required ' }]}>
                            <div dangerouslySetInnerHTML={{ __html: editor }} style={{ display: 'none' }} />
                            {editorLoaded && (
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={editor}
                                    onChange={(event: any, editor: any) => {
                                        const data = editor.getData();
                                        handleEditorChange(data);
                                    }}
                                />
                            )}
                        </Form.Item>

                        <Form.Item label="Print Format" name="print_format" required={true} rules={[{ required: true, message: 'Print Format field is required.' }]}>
                            <Select>
                                {formFields?.print_format?.map((val: any) => {
                                    return <Select.Option value={val.id}>{val.name}</Select.Option>;
                                })}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Letter Pad Logo" name="letter_pad_logo" required={true} rules={[{ required: true, message: 'Letter Pad Logo field is required.' }]}>
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
                <Modal title="View Material" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
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

export default Material;
