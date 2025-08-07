import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, Spin } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { baseUrl, Success, useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import Models from '@/imports/models.import';
import { scrollConfig } from '@/utils/constant';

const City = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create City');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
    });

    // get Tax datas
    useEffect(() => {
        cityList(1);
    }, []);

    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        cityList(1);
    }, [debouncedSearch]);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit City');
        } else {
            setDrawerTitle('Create City');
        }
    }, [editRecord, open]);

    const cityList = async (page: any) => {
        try {
            const body = bodyData();
            setState({ loading: true });

            const res: any = await Models.city.cityList(page, body);
            setState({
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
                cityList: res.results,
            });
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
            title: 'City Name',
            dataIndex: 'name',
            key: 'id',
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

                    {/* <DeleteOutlined onClick={() => handleDelete(record)} className="delete-icon" rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    const handleDelete = (record: any) => {
        const Token = localStorage.getItem('token');

        Modal.confirm({
            title: 'Are you sure, you want to delete this City record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                deleteCity(record);
            },
        });
    };

    const deleteCity = async (record: any) => {
        try {
            const res: any = await Models.city.delete(record.id);
            cityList(state.currentPage);
            Success('City deleted successfully');
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        cityList(number);
        return number;
    };

    // form submit
    const onFinish = async (values: any) => {
        try {
            setState({ btnLoading: true });
            if (editRecord) {
                const res = await Models.city.update(editRecord.id, values);
                cityList(state.currentPage);
                setState({ btnLoading: false });
                setOpen(false);
                Success('City updated successfully');
            } else {
                const res = await Models.city.create(values);
                cityList(state.currentPage);
                setState({ btnLoading: false });
                setOpen(false);
                Success('City created successfully');
            }
            form.resetFields();
        } catch (error) {
            setState({ btnLoading: false });

            console.log('✌️error --->', error);
        }
    };

    type FieldType = {
        name?: string;
    };

    // Model Data
    const modalData = () => {
        const formatDate = (dateString: any) => {
            if (!dateString) {
                return 'N/A';
            }

            const date = new Date(dateString);

            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }

            return new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }).format(date);
        };

        const data = [
            {
                label: 'City Name:',
                value: viewRecord?.name || 'N/A',
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


    return (
        <>
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage City</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create City
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.cityList}
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

                {state.cityList?.length > 0 && (
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

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} autoComplete="off">
                        <Form.Item<FieldType> label="City Name" name="name" required={true} rules={[{ required: true, message: 'City Name field is required.' }]}>
                            <Input />
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

export default City;
