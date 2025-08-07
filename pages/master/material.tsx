import React, { useEffect, useState, useRef } from 'react';
import { Space, Table, Modal, Select, Spin } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import moment from 'moment';
import router from 'next/router';
import { baseUrl, commomDateFormat, Failure, Success, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import { scrollConfig } from '@/utils/constant';

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

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
    });

    useEffect(() => {
        getMaterial(1);
        getDropDown();
    }, []);

    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        getMaterial(1);
    }, [debouncedSearch]);

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

    const getMaterial = async (page: any) => {
        try {
            const body = bodyData();
            setState({ loading: true });

            const res: any = await Models.material.materialList(page, body);
            setState({
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
            });
            setDataSource(res.results);
            setFilterData(res.results);
        } catch (error) {
            setState({ loading: false });
            console.log('✌️error --->', error);
        }
    };

    const bodyData = () => {
        const body: any = {};
        if (state.search) {
            body.search = state.search;
        }
        return body;
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
            form.setFieldsValue({
                ...record,
                print_format: record.print_format?.id,
                letter_pad_logo: record.letter_pad_logo?.id,
            });
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
                const formattedDate = moment(text, 'YYYY-MM-DD').isValid() ? commomDateFormat(text) : ''; // Empty string for invalid dates
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
                </Space>
            ),
        },
    ];

    const [filterData, setFilterData] = useState(dataSource);

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        getMaterial(number);
        return number;
    };

    const handleSubmit = async (values: any) => {
        try {
            setState({ btnLoading: true });
            const body = {
                template: editor == null ? '' : editor,
                material_name: values.material_name,
                letter_pad_logo: values.letter_pad_logo,
                print_format: values.print_format,
            };

            if (editRecord) {
                await Models.material.update(body, editRecord.id);
                getMaterial(1);
                onClose();
                form.resetFields();
                setState({ btnLoading: false });
                Success('Material updated successfully');
            } else {
                await Models.material.create(body);
                getMaterial(1);
                onClose();
                form.resetFields();
                setState({ btnLoading: false });
                Success('Material created successfully');
            }
        } catch (error: any) {
            setState({ btnLoading: false });

            if (error?.template?.length > 0) {
                Failure(`Template : ${error?.template[0]}`);
            }
            if (error?.material_name?.length > 0) {
                Failure(` ${error?.material_name[0]}`);
            }
            console.log('✌️error --->', error);
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

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

    return (
        <>
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Material</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Material
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
                            spinning: state.loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>

                {filterData?.length > 0 && (
                    <div>
                        <div
                            
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Pagination totalPage={state.total} itemsPerPage={10} currentPages={state.currentPage} activeNumber={handlePageChange} />
                        </div>
                    </div>
                )}

                <Drawer title={DrawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={handleSubmit} onFinishFailed={onFinishFailed} autoComplete="off">
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
                                    <Button type="primary" htmlType="submit" loading={state.btnLoading}>
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
