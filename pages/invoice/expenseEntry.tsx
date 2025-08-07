import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, InputNumber, Button, Drawer, Form, Input, Select, DatePicker, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { baseUrl, roundNumber, ObjIsEmpty, useSetState, Dropdown, commomDateFormat } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import Models from '@/imports/models.import';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';

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

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        expenseList: [],
        discount: 0,
        searchValue: null,
        expenseCatHasNext: null,
        expenseCatCurrentPage: 1,
        expenseCatList: [],
    });

    useEffect(() => {
        initialData(1);
        expenseCatList(1);
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
                expense_category: { value: record.expense_category, label: record.expense_category_name },
                expense_user: record.expense_user,
                id: record.id,
                narration: record.narration,
            };

            console.log('updateData', updateData);

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
        setState({ btnLoading: false });
    };

    const expenseCatList = async (page = 1) => {
        try {
            const res: any = await Models.expense.expenseList(page, undefined);
            const dropdown = Dropdown(res?.results, 'expense_name');
            setState({ expenseCatList: dropdown, expenseCatHasNext: res?.next, expenseCatCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const expenseCatSearch = async (text: any) => {
        try {
            const res: any = await Models.expense.expenseSearch(text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'expense_name');
                setState({ expenseCatList: dropdown, expenseCatHasNext: res?.next, expenseCatCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const expenseCatLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.expense.expenseList(page, undefined);
            const dropdown = Dropdown(res?.results, 'expense_name');
            setState({ expenseCatList: [...state.expenseCatList, ...dropdown], expenseCatHasNext: res?.next, expenseCatCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const handleDelete = async (record: any) => {
        console.log('✌️record --->', record);
        try {
            await Models.expenseEntry.delete(record.id);
        } catch (error) {
            setState({ testDeleteLoading: false });
            console.log('✌️error --->', error);
        }
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
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
            },
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
                return commomDateFormat(text);
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
                    {/* <DeleteOutlined style={{ color: 'red', cursor: 'pointer' }} onClick={() => handleDelete(record)} className="delete-icon" rev={undefined} /> */}
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
    const handleSubmit = async (values: any) => {
        try {
            setState({ btnLoading: true });
            const formattedData = {
                ...values,
                expense_user: values.expense_user,
                date: dayjs(values.date), // Updated date formatting
                expense_category: values.expense_category.value,
                amount: values.amount,
                narration: values.narration,
            };
            if (editRecord) {
                const res = await Models.expenseEntry.update(editRecord.id, formattedData);
                initialData(1);
                onClose();
            } else {
                const res = await Models.expenseEntry.create(formattedData);
                initialData(1);
                onClose();
            }
        } catch (error) {
            setState({ btnLoading: false });

            console.log('✌️error --->', error);
        }
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
                value: roundNumber(viewRecord?.amount) || 'N/A',
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

    const initialData = async (page: any) => {
        try {
            setState({ loading: true });

            const res: any = await Models.expenseEntry.expenseEntryList(page);
            setState({
                expenseList: res?.results,
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
            });
        } catch (error) {
            setState({ loading: false });
            console.log('✌️error --->', error);
        }
    };

    const bodyData = () => {
        const body: any = {};
        if (state.searchValue) {
            if (state.searchValue?.expense_user) {
                body.expense_user = state.searchValue.expense_user;
            }
            if (state.searchValue?.expense_category) {
                body.expense_category = state.searchValue.expense_category;
            }
            if (state.searchValue?.from_date) {
                body.from_date = state.searchValue.from_date;
            }

            if (state.searchValue?.to_date) {
                body.to_date = state.searchValue.to_date;
            }
        }

        return body;
    };

    // form submit
    const onFinish2 = async (values: any, page = 1) => {
        try {
            setState({ loading: true });

            const body = {
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                expense_user: values.expense_user ? values.expense_user : '',
                expense_category: values.expense_category ? values.expense_category?.value : '',
            };

            const res: any = await Models.expenseEntry.filter(body, page);
            setState({
                expenseList: res?.results,
                currentPage: page,
                pageNext: res?.next,
                pagePrev: res?.previous,
                total: res?.count,
                loading: false,
                searchValue: values,
            });
        } catch (error) {
            setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });

        const body = bodyData();

        if (!ObjIsEmpty(body)) {
            onFinish2(state.searchValue, number);
        } else {
            initialData(number);
        }

        return number;
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
                                <CustomSelect
                                    onSearch={(data: any) => expenseCatSearch(data)}
                                    value={state.expenseCat}
                                    options={state.expenseCatList}
                                    className=" flex-1"
                                    onChange={(selectedOption: any) => {
                                        form.setFieldsValue({ expense_category: selectedOption });
                                        expenseCatList(1);
                                    }}
                                    loadMore={() => {
                                        if (state.expenseCatHasNext) {
                                            expenseCatLoadMore(state.expenseCatCurrentPage + 1);
                                        }
                                    }}
                                    isSearchable
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '250px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <div style={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: '10px' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ width: '100px' }}>
                                        Search
                                    </Button>
                                </Form.Item>
                                <Form.Item>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        onClick={() => {
                                            form.resetFields();
                                        }}
                                        style={{ width: '100px' }}
                                    >
                                        Clear
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
                        dataSource={state.expenseList}
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
                {state.expenseList?.length > 0 && (
                    <div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Pagination totalPage={state.total} itemsPerPage={10} currentPages={state.currentPage} activeNumber={handlePageChange} />
                            {/* <Pagination activeNumber={handlePageChange} totalPages={state.total} currentPages={state.currentPage} /> */}
                        </div>
                    </div>
                )}

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form
                        name="basic"
                        layout="vertical"
                        form={form}
                        initialValues={{ remember: true }}
                        onFinish={(value: any) => handleSubmit(value)}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        <Form.Item label="Expense User" name="expense_user" required={true} rules={[{ required: true, message: 'Expense User field is required.' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Expense Category" name="expense_category" required={true} rules={[{ required: true, message: 'Expense Category field is required.' }]}>
                            <CustomSelect
                                onSearch={(data: any) => expenseCatSearch(data)}
                                value={form.getFieldValue}
                                options={state.expenseCatList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    form.setFieldsValue({ expense_category: selectedOption });
                                    expenseCatList(1);
                                }}
                                loadMore={() => {
                                    if (state.expenseCatHasNext) {
                                        expenseCatLoadMore(state.expenseCatCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
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
                                    <Button type="primary" htmlType="submit" loading={state.btnLoading}>
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
