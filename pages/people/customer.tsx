import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, InputNumber } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input, Select, Spin } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import { baseUrl, useSetState, Dropdown } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import Models from '@/imports/models.import';
import useDebounce from '@/components/useDebounce/useDebounce';
import { scrollConfig } from '@/utils/constant';
import CustomSelect from '@/components/Select';

const Customer = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Employee Details');
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
        search: '',
        cityHasNext: null,
        cityCurrentPage: 1,
        cityList: [],
        stateHasNext: null,
        stateCurrentPage: 1,
        stateList: [],
        countryHasNext: null,
        countryCurrentPage: 1,
        countryList: [],
    });

    useEffect(() => {
        getCustomer(1);
        getDropDownValues();
        cityList();
        stateList();
        countryList();
    }, []);

    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        getCustomer(1);
    }, [debouncedSearch]);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Customer');
        } else {
            setDrawerTitle('Create Customer');
        }
    }, [editRecord, open]);

    // const getCustomer = () => {
    //     setLoading(true)
    //     axios
    //         .get(`${baseUrl}/customer_list/`, {
    //             headers: {
    //                 Authorization: `Token ${localStorage.getItem('token')}`,
    //             },
    //         })
    //         .then((res) => {
    //             setDataSource(res.data);
    //             setFilterData(res.data);
    //             setLoading(false)
    //         })
    //         .catch((error: any) => {
    //             if (error?.response?.status === 401) {
    //                 router.push('/');
    //             }
    //             setLoading(false)
    //         });
    // };

    const getCustomer = async (page: any) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.customer.costomerList(page, body);
            setState({
                // invoiceList: res?.results,
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

    const getDropDownValues = () => {
        const Token = localStorage.getItem('token');
        axios
            .get(`${baseUrl}/create_customer/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setFormFields(res.data);
            })
            .catch((error) => {
                if (error?.response?.status === 401) {
                    // Navigate to the home page
                    router.push('/');
                }
            });
    };

    const cityList = async (page = 1) => {
        try {
            const res: any = await Models.city.cityList(page, null);
            const dropdown = Dropdown(res?.results, 'name');
            setState({ cityList: dropdown, cityHasNext: res?.next, cityCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const citySearch = async (text: any) => {
        try {
            const res: any = await Models.city.cityList(1, text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'test_name');
                setState({ cityList: dropdown, cityHasNext: res?.next, cityCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const cityLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.city.cityList(page, null);
            const dropdown = Dropdown(res?.results, 'name');
            setState({ cityList: [...state.cityList, ...dropdown], cityHasNext: res?.next, cityCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const stateList = async (page = 1) => {
        try {
            const res: any = await Models.state.stateList(page, null);
            const dropdown = Dropdown(res?.results, 'name');
            setState({ stateList: dropdown, stateHasNext: res?.next, stateCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const stateSearch = async (text: any) => {
        try {
            const res: any = await Models.state.stateList(1, text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'test_name');
                setState({ stateList: dropdown, stateHasNext: res?.next, stateCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const stateLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.state.stateList(page, null);
            const dropdown = Dropdown(res?.results, 'name');
            setState({ stateList: [...state.stateList, ...dropdown], stateHasNext: res?.next, stateCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const countryList = async (page = 1) => {
        try {
            const res: any = await Models.state.countryList(page, null);
            const dropdown = Dropdown(res?.results, 'name');
            setState({ countryList: dropdown, countryHasNext: res?.next, countryCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const countrySearch = async (text: any) => {
        try {
            const res: any = await Models.state.countryList(1, text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'test_name');
                setState({ countryList: dropdown, countryHasNext: res?.next, countryCurrentPage: 1 });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const countryLoadMore = async (page = 1) => {
        try {
            const res: any = await Models.state.countryList(page, null);
            const dropdown = Dropdown(res?.results, 'name');
            setState({ countryList: [...state.countryList, ...dropdown], countryHasNext: res?.next, countryCurrentPage: page });
        } catch (error: any) {
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
    const showDrawer = async (record: any) => {
        if (record) {
            try {
                const res: any = await Models.customer.customer(record.id);

                setEditRecord(record);
                console.log('showDrawer', res);

                form.setFieldsValue({
                    ...record,
                    city1: { value: res?.city1?.id, label: res?.city1?.name },
                    state1: { value: res?.state1?.id, label: res?.state1?.name },
                    country1: { value: res?.country1?.id, label: res?.country1?.name },
                    city2: { value: res?.city2?.id, label: res?.city2?.name },
                    state2: { value: res?.state2?.id, label: res?.state2?.name },
                    country2: { value: res?.country2?.id, label: res?.country2?.name },
                });
            } catch (error) {
                console.log(error);
            }
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

    const handleDelete = async (record: any) => {
        console.log('✌️record --->', record);
        try {
            await Models.customer.delete(record.id);
        } catch (error) {
            setState({ testDeleteLoading: false });
            console.log('✌️error --->', error);
        }
    };

    // table heading
    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customer_name',
            key: 'customer_name',
            className: 'singleLineCell',
        },
        {
            title: 'Phone Number',
            dataIndex: 'phone_no',
            key: 'phone_no',
            className: 'singleLineCell',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
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

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        getCustomer(number);
        return number;
    };

    // form submit

    const onFinish = async (values: any) => {
        console.log('values', values);
        try {
            const body = {
                customer_name: values.customer_name,
                phone_no: values.phone_no,
                gstin_no: values.gstin_no,
                email: values.email,
                address1: values.address1,
                city1: values.city1?.value,
                state1: values.state1?.value,
                country1: values.country1?.value,
                pincode1: values.pincode1,
                contact_person1: values.contact_person1,
                mobile_no1: values.mobile_no1,
                contact_person_email1: values.contact_person_email1,
                place_of_testing: values.place_of_testing,
                address2: values.address2,
                city2: values.city2?.value,
                state2: values.state2?.value,
                country2: values.country2?.value,
                pincode2: values.pincode2,
                contact_person2: values.contact_person2,
                mobile_no2: values.mobile_no2,
                contact_person_email2: values.contact_person_email2,
            };

            console.log('body', body);

            if (editRecord) {
                const res: any = await Models.customer.updateCustomer(editRecord.id, body);
                form.resetFields();
                getCustomer(1);
                setEditRecord(null);
            } else {
                const res: any = await Models.customer.createCustomer(body);
                form.resetFields();
                getCustomer(1);
            }
        } catch (error) {
            console.log('✌️error --->', error);
        } finally {
            onClose();
        }
    };
    const onFinishFailed = (errorInfo: any) => {};

    type FieldType = {
        customer_name?: string;
        phone_no?: string;
        gstin_no?: string;
        email?: string;
        address1?: string;
        city1?: string;
        state1?: string;
        country1?: string;
        pincode1?: string;
        contact_person1?: string;
        mobile_no1?: string;
        contact_person_email1?: string;
        code?: string;
        place_of_testing?: string;
        address2?: string;
        city2?: string;
        state2?: string;
        country2?: string;
        pincode2?: string;
        contact_person2?: string;
        mobile_no2?: string;
        contact_person_email2?: string;
    };

    const { TextArea } = Input;

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
                label: 'Customer Name:',
                value: viewRecord?.customer_name || 'N/A',
            },
            {
                label: 'phone No:',
                value: viewRecord?.phone_no || 'N/A',
            },
            {
                label: 'gstin No:',
                value: viewRecord?.gstin_no || 'N/A',
            },
            {
                label: 'email:',
                value: viewRecord?.email || 'N/A',
            },

            {
                label: 'Address 1:',
                value: viewRecord?.address1 || 'N/A',
            },
            {
                label: 'City 1:',
                value: viewRecord?.city1?.name || 'N/A',
            },
            {
                label: 'State 1:',
                value: viewRecord?.state1?.name || 'N/A',
            },
            {
                label: 'Country 1:',
                value: viewRecord?.country1?.name || 'N/A',
            },

            {
                label: 'Pincode 1:',
                value: viewRecord?.pincode1 || 'N/A',
            },
            {
                label: 'Address 2:',
                value: viewRecord?.address2 || 'N/A',
            },

            {
                label: 'City 2:',
                value: viewRecord?.city2 || 'N/A',
            },
            {
                label: 'State 2:',
                value: viewRecord?.state2 || 'N/A',
            },
            {
                label: 'Country 2:',
                value: viewRecord?.country2 || 'N/A',
            },
            {
                label: 'Pincode 2:',
                value: viewRecord?.pincode2 || 'N/A',
            },
            {
                label: 'contact Person 1:',
                value: viewRecord?.contact_person1 || 'N/A',
            },
            {
                label: 'mobile No 1 :',
                value: viewRecord?.mobile_no1 || 'N/A',
            },
            {
                label: 'contact_person Email 1:',
                value: viewRecord?.contact_person_email1 || 'N/A',
            },
            {
                label: 'contact Person 2:',
                value: viewRecord?.contact_person2 || 'N/A',
            },

            {
                label: 'mobile No 2:',
                value: viewRecord?.mobile_no2 || 'N/A',
            },

            {
                label: 'contact Person Email 2:',
                value: viewRecord?.contact_person2 || 'N/A',
            },
            {
                label: 'place Of Testing :',
                value: viewRecord?.place_of_testing || 'N/A',
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

    console.log("form.getFieldValue('city1')?.label", form.getFieldValue('city1'));

    return (
        <>
            <div className="panel ">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Customer Details</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Customer
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
                        <Form.Item<FieldType> label="Customer Name" name="customer_name" required={true} rules={[{ required: true, message: 'Please input your Customer Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Phone Number" name="phone_no" required={true} rules={[{ required: true, message: 'Please input your Phone Number!' }]}>
                            <InputNumber minLength={10} maxLength={10} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType> label="GST in" name="gstin_no" required={true} rules={[{ required: true, message: 'Please input your GST in!' }]}>
                            <Input maxLength={15} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Email" name="email" required={true} rules={[{ required: true, message: 'Please input your EMail!' }]}>
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item<FieldType> label="Address 1" name="address1" required={true} rules={[{ required: true, message: 'Please input your Address1!' }]}>
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item<FieldType> label="City 1" name="city1" required={true} rules={[{ required: true, message: 'Please input your City 1!' }]}>
                            {/* <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.city1?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select> */}

                            <CustomSelect
                                onSearch={(data: any) => citySearch(data)}
                                // value={form.getFieldValue('city1')}
                                options={state.cityList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    console.log('selectedOption', selectedOption);

                                    form.setFieldsValue({ city1: selectedOption });
                                    cityList(1);
                                }}
                                loadMore={() => {
                                    if (state.cityHasNext) {
                                        cityLoadMore(state.cityCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        <Form.Item<FieldType> label="State 1" name="state1" required={true} rules={[{ required: true, message: 'Please input your State 1!' }]}>
                            {/* <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.state1?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>  */}

                            <CustomSelect
                                onSearch={(data: any) => stateSearch(data)}
                                value={form.getFieldValue('state1')?.label}
                                options={state.stateList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    form.setFieldsValue({ state1: selectedOption });
                                    stateList(1);
                                }}
                                loadMore={() => {
                                    if (state.stateHasNext) {
                                        stateLoadMore(state.stateCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        <Form.Item<FieldType> label="Country 1" name="country1" required={true} rules={[{ required: true, message: 'Please input your Country 1!' }]}>
                            {/* <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.country1?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select> */}

                            <CustomSelect
                                onSearch={(data: any) => countrySearch(data)}
                                value={form.getFieldValue('country1')?.label}
                                options={state.countryList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    form.setFieldsValue({ country1: selectedOption });
                                    countryList(1);
                                }}
                                loadMore={() => {
                                    if (state.countryHasNext) {
                                        countryLoadMore(state.countryCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        <Form.Item<FieldType> label="Pincode 1" name="pincode1" required={true} rules={[{ required: true, message: 'Please input your Pincode 1!' }]}>
                            <InputNumber maxLength={6} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Address 2" name="address2" required={false} rules={[{ required: false, message: 'Please input your Address 2!' }]}>
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item<FieldType> label="City 2" name="city2" required={false} rules={[{ required: false, message: 'Please input your City 2!' }]}>
                            {/* <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                {formFields?.city2?.map((val: any) => (
                                    <Select.Option key={val.name} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select> */}

                            <CustomSelect
                                onSearch={(data: any) => citySearch(data)}
                                value={form.getFieldValue('city2')?.label}
                                options={state.cityList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    console.log('selectedOption', selectedOption);

                                    form.setFieldsValue({ city2: selectedOption });
                                    cityList(1);
                                }}
                                loadMore={() => {
                                    if (state.cityHasNext) {
                                        cityLoadMore(state.cityCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        <Form.Item<FieldType> label="State 2" name="state2" required={false} rules={[{ required: false, message: 'Please input your State 2!' }]}>
                            <CustomSelect
                                onSearch={(data: any) => stateSearch(data)}
                                value={form.getFieldValue('state2')?.label}
                                options={state.stateList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    form.setFieldsValue({ state2: selectedOption });
                                    stateList(1);
                                }}
                                loadMore={() => {
                                    if (state.stateHasNext) {
                                        stateLoadMore(state.stateCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        <Form.Item<FieldType> label="Country 2" name="country2" required={false} rules={[{ required: false, message: 'Please input your Country 2!' }]}>
                            <CustomSelect
                                onSearch={(data: any) => countrySearch(data)}
                                value={form.getFieldValue('country2')?.label}
                                options={state.countryList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    form.setFieldsValue({ country2: selectedOption });
                                    countryList(1);
                                }}
                                loadMore={() => {
                                    if (state.countryHasNext) {
                                        countryLoadMore(state.countryCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        <Form.Item<FieldType> label="Pincode 2" name="pincode2" required={false} rules={[{ required: false, message: 'Please input your Pincode 2!' }]}>
                            <InputNumber maxLength={6} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Contact Person 1" name="contact_person1" required={false} rules={[{ required: false, message: 'Please input your Contact Person 1!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Mobile Number 1" name="mobile_no1" required={false} rules={[{ required: false, message: 'Please input your Mobile Number 1!' }]}>
                            <InputNumber maxLength={10} minLength={10} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Contact Person Email1"
                            name="contact_person_email1"
                            required={false}
                            rules={[{ required: false, message: 'Please input your Contact Person Email 1!' }]}
                        >
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item<FieldType> label="Contact Person 2" name="contact_person2" required={false} rules={[{ required: false, message: 'Please input your Contact Person 2!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Mobile Number 2" name="mobile_no2" required={false} rules={[{ required: false, message: 'Please input your Mobile Number 2!' }]}>
                            <InputNumber maxLength={10} minLength={10} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item<FieldType>
                            label="Contact Person Email2"
                            name="contact_person_email2"
                            required={false}
                            rules={[{ required: false, message: 'Please input your Contact Person Email2!' }]}
                        >
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item<FieldType> label="Place Of Testing" name="place_of_testing" required={false} rules={[{ required: false, message: 'Please input your Place Of Testing!' }]}>
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
                <Modal title="View Customer" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
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

export default Customer;
