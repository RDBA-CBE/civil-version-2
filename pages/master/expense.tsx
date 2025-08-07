import React, { useEffect, useState } from 'react';
import { Space, Table, Modal, Spin } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import { baseUrl, commomDateFormat, Success, useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import Models from '@/imports/models.import';
import { result } from 'lodash';
import { scrollConfig } from '@/utils/constant';

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

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
    });

    useEffect(() => {
        getExpense(1);
    }, []);

    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        getExpense(1);
    }, [debouncedSearch]);

    const getExpense = async (page: any) => {
        try {
            const body = bodyData();
            setState({ loading: true });

            const res: any = await Models.expense.expenseList(page, body);
            setState({
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
            });
            setDataSource(res?.results);
            setFilterData(res?.results);
        } catch (error) {
            setState({ loading: false });
            console.log('✌️error --->', error);
        }
    };

    const handleDelete = (record: any) => {
        // Implement your delete logic here

        Modal.confirm({
            title: 'Are you sure, you want to delete this EXPENSE record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                deleteExpence(record);
            },
        });
    };

    const deleteExpence = async (record: any) => {
        try {
            const res: any = await Models.expense.delete(record.id);
            Success('Expense Category deleted successfully');
            getExpense(state.currentPage);
        } catch (error) {
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

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        getExpense(number);
        return number;
    };

    // form submit
    const onFinish = async (values: any) => {
        try {
            setState({ btnLoading: true });
            if (editRecord) {
                const res = await Models.expense.update(editRecord.id, values);
                getExpense(state.currentPage);
                setOpen(false);
                setState({ btnLoading: false });
                Success('Expense Category updated successfully');
            } else {
                const res = await Models.expense.create(values);
                getExpense(state.currentPage);
                setOpen(false);
                setState({ btnLoading: false });
                Success('Expense Category created successfully');
            }
            form.resetFields();
        } catch (error) {
            setState({ btnLoading: false });

            console.log('✌️error --->', error);
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

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
                const formattedDate = moment(text, 'YYYY-MM-DD').isValid() ? commomDateFormat(text) : ''; // Empty string for invalid dates
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

                    {/* <DeleteOutlined onClick={() => handleDelete(record)} className="delete-icon" rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    return (
        <>
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Expense Category</h1>
                    </div>
                    <div>
                        <Search placeholder="input search text" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Expense Category
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
                                    <Button type="primary" htmlType="submit" loading={state.btnLoading}>
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
