import React, { useEffect, useState } from 'react';
import { Space, Table, Modal } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input, InputNumber, Select, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import { baseUrl, Dropdown, roundNumber, Success, useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import Models from '@/imports/models.import';
import CustomSelect from '@/components/Select';
import { scrollConfig } from '@/utils/constant';

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

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        materialCurrentPage: 1,
        materialPageNext: null,
        materialLoading: false,
        materialList: [],
    });

    // get test
    useEffect(() => {
        getTest(1);
        materialList(1);
    }, []);

    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        getTest(1);
    }, [debouncedSearch]);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Test');
        } else {
            setDrawerTitle('Create Test');
        }
    });

    const materialList = async (page: any) => {
        try {
            const body = bodyData();
            setState({ materialLoading: true });

            const res: any = await Models.material.materialList(page, body);
            const dropdown = Dropdown(res.results, 'material_name');
            setState({
                materialCurrentPage: page,
                materialPageNext: res?.next,
                materialLoading: false,
                materialList: dropdown,
            });
        } catch (error) {
            setState({ materialLoading: false });
            console.log('✌️error --->', error);
        }
    };

    const materialLoadMore = async (page: any) => {
        try {
            const body = bodyData();
            setState({ materialLoading: true });

            const res: any = await Models.material.materialList(page, body);
            const dropdown = Dropdown(res.results, 'material_name');
            setState({
                materialCurrentPage: page,
                materialPageNext: res?.next,
                materialLoading: false,
                materialList: [...state.materialList, ...dropdown],
            });
        } catch (error) {
            setState({ materialLoading: false });
            console.log('✌️error --->', error);
        }
    };

    const materialSearch = async (text: any) => {
        try {
            const body = {
                search: text,
            };

            const res: any = await Models.material.materialList(1, body);
            const dropdown = Dropdown(res.results, 'material_name');
            setState({
                materialCurrentPage: 1,
                materialPageNext: res?.next,
                materialLoading: false,
                materialList: dropdown,
            });
        } catch (error) {
            setState({ loading: false });
            console.log('✌️error --->', error);
        }
    };

    const getTest = async (page: any) => {
        try {
            const body = bodyData();
            setState({ loading: true });

            const res: any = await Models.test.testList(page, body);
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

    const showModal = (record: any) => {
        const testRecord = {
            material_name: record?.material_name.material_name,
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
                material_name: { value: record.material_name.id, label: record.material_name.material_name },
                test_name: record.test_name,
                price_per_piece: record.price_per_piece,
                id: record.id,
            };
            materialList(1);
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

    // const handleDelete = async (item: any) => {
    //     try {
    //         const res = await Models.test.delete(item?.id);
    //         console.log('✌️res --->', res);
    //         getTest(state.currentPage);
    //     } catch (error) {
    //         console.log('✌️error --->', error);
    //     }
    // };

    const columns = [
        {
            title: 'Test Name',
            dataIndex: 'test_name',
            key: 'test_name',
            className: 'singleLineCell',
        },
        {
            title: 'Material Name',
            // dataIndex: 'material_name',
            key: 'material_name',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{record.material_name.material_name}</div>;
            },
        },
        {
            title: 'Price',
            dataIndex: 'price_per_piece',
            key: 'price_per_piece',
            className: 'singleLineCell',
            render: (record: any) => {
                return <div>{roundNumber(record)}</div>;
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
                    {/* <DeleteOutlined onClick={() => handleDelete(record)} className="delete-icon" rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        getTest(number);
        return number;
    };

    // form submit
    const handleSubmit = async (values: any) => {
        setState({ btnLoading: true });
        try {
            const body = {
                material_name: values.material_name?.value,
                test_name: values.test_name,
                price_per_piece: values.price_per_piece,
            };

            if (editRecord) {
                const res = await Models.test.update(editRecord.id, body);
                getTest(state.currentPage);
                form.resetFields();
                setOpen(false);
                setState({ btnLoading: false });
                Success('Test updated successfully');
            } else {
                const res = await Models.test.create(body);
                getTest(state.currentPage);
                setOpen(false);
                form.resetFields();
                setState({ btnLoading: false });
                Success('Test created successfully');
            }
        } catch (error) {
            setState({ btnLoading: false });

            console.log('✌️error --->', error);
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
                label: 'Price Per Piece:',
                value: roundNumber(viewRecord?.price_per_piece) || 'N/A',
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
                        <h1 className="text-lg font-semibold dark:text-white-light">Manage Test</h1>
                    </div>
                    <div>
                        <Search placeholder="input search text" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
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
                        pagination={false}
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

                <Drawer title={drawertitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={handleSubmit} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item label="Material Name" name="material_name" required={true} rules={[{ required: true, message: 'Please Select your Material Name!' }]}>
                            <CustomSelect
                                onSearch={(data: any) => materialSearch(data)}
                                value={state.material_name}
                                options={state.materialList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    form.setFieldsValue({ material_name: selectedOption });
                                    materialList(state.materialCurrentPage);
                                }}
                                loadMore={() => {
                                    if (state.materialPageNext) {
                                        materialLoadMore(state.materialCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
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
                                    <Button type="primary" htmlType="submit" loading={state.btnLoading}>
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
