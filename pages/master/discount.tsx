import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, Spin, Select } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import router from 'next/router';
import { baseUrl, Failure, Success, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import IconLoader from '@/components/Icon/IconLoader';

const Discount = () => {
    const { Search } = Input;
    const [form] = Form.useForm();

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Add Customer Discount');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [dataSource, setDataSource] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterData, setFilterData] = useState(dataSource);
    const [loading, setLoading] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState(null);

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        discountList: [],
        search: '',
        btnLoading: false,
        excelLoading: false,
    });

    // get Tax datas
    useEffect(() => {
        getCustomerDiscount(state.currentPage);
        customersList();
    }, []);

    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        getCustomerDiscount(1);
    }, [debouncedSearch]);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Update Customer Discount');
        } else {
            setDrawerTitle('Add Customer Discount');
        }
    }, [editRecord, open]);

    const getCustomerDiscount = async (page: number) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.discount.customerDiscountList(page, body);
            setState({
                discountList: res?.results,
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

    const customersList = async () => {
        try {
            // setState({ loading: true });

            const res: any = await Models.discount.customerList();
            setCustomerList(res?.customer);
            // setState({ loading: false });
        } catch (error: any) {
            // setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const bodyData = () => {
        const body: any = {};
        if (state.search) {
            body.customer = state.search;
        }
        return body;
    };

    const handleSelectChange = async (customerId: any) => {
        try {
            // const res = await Models.discount.details(customerId);
            // console.log('customer --->', res);
            setSelectedCustomerId(customerId);
        } catch (error) {
            console.log('✌️error --->', error);
        }
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
    const showDrawer = async (record: any) => {
        console.log('✌️record --->', record);
        try {
            if (record) {
                const body = {
                    customer: record?.customer?.id,
                    id: record?.id,
                    discount: record?.discount,
                };
                // const res = await Models.discount.details(record.id);
                // console.log('✌️res --->', res);

                setEditRecord(body);
                form.setFieldsValue(body); // Set form values for editing
            } else {
                setEditRecord(null);
                form.resetFields();
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }

        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
    };

    const columns = [
        {
            title: 'Customer Name',
            dataIndex: 'customer',
            key: 'id',
            className: 'singleLineCell',
            render: (text: any, record: any) => <div>{record?.customer?.customer_name}</div>,
        },
        {
            title: 'Discount',
            dataIndex: 'discount',
            key: 'id',
            className: 'singleLineCell',
            render: (text: any, record: any) => <div>{record?.discount}</div>,
        },
        ...(localStorage.getItem('admin') === 'true'
            ? [
                  {
                      title: 'Actions',
                      key: 'actions',
                      className: 'singleLineCell',
                      render: (text: any, record: any) => (
                          <Space size="middle">
                              <EditOutlined style={{ cursor: 'pointer' }} onClick={() => showDrawer(record)} className="edit-icon" rev={undefined} />
                          </Space>
                      ),
                  },
              ]
            : []),
    ];

    // Table Datas

    // form submit
    const onFinish = async (values: any) => {
        try {
            setState({ btnLoading: true });
            const body = {
                customer: values.customer,
                discount: Number(values.discount),
            };
            if (editRecord) {
                await Models.discount.updateDiscount(editRecord.id, body);
                form.resetFields();
                onClose();
                await getCustomerDiscount(1);
                setEditRecord(null);
                setState({ btnLoading: false });
                Success('Customer discount updated successfully');
            } else {
                await Models.discount.createDiscount(body);
                form.resetFields();
                setEditRecord(null);
                onClose();
                await getCustomerDiscount(1);
                setState({ btnLoading: false });
                Success('Customer discount added successfully');
            }
        } catch (error: any) {
            setState({ btnLoading: false });

            if (error?.customer?.length > 0) {
                Failure(error?.customer[0]);
            }
            console.log('✌️error --->', error);
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

    type FieldType = {
        name?: string;
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

    const scrollConfig: any = {
        x: true,
        y: 300,
    };

    const handlePageChange = (number: any) => {
        console.log('✌️number --->', number);

        getCustomerDiscount(number);
        setState({ currentPage: number });

        return number;
    };

    const fetchAllCustomerDiscounts = async () => {
        try {
            setState({ excelLoading: true });
            let allData: any[] = [];
            let page = 1;
            let hasNextPage = true;

            while (hasNextPage) {
                const body = bodyData();
                const res: any = await Models.discount.customerDiscountList(page, body);

                if (res?.results?.length) {
                    allData = allData.concat(res.results);
                }

                if (res?.next) {
                    page += 1;
                } else {
                    hasNextPage = false;
                }
            }

            await exportToExcel(allData);
        } catch (error) {
            setState({ excelLoading: false });

            console.log('✌️ Error while fetching all discounts --->', error);
        } finally {
            setState({ excelLoading: false });
        }
    };

    const exportToExcel = async (fullData: any[]) => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet1');

        worksheet.addRow(['Customer Name', 'Discount']);

        fullData.forEach((row: any) => {
            worksheet.addRow([row.customer?.customer_name || '', row.discount === 0 || row.discount === 0.0 ? 0 : row.discount || '']);
        });
        const blob = await workbook.xlsx.writeBuffer();

        FileSaver.saveAs(
            new Blob([blob], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            'Customer_Discount.xlsx'
        );
    };

    return (
        <>
            <div className="panel">
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Customer Discount</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Add Customer Discount
                        </button>
                        <button type="button" onClick={fetchAllCustomerDiscounts} className="create-button ">
                            {state.excelLoading ? <IconLoader /> : 'Export to Excel'}
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.discountList}
                        columns={columns}
                        pagination={false}
                        scroll={scrollConfig}
                        loading={{
                            spinning: state.loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                    {state.discountList?.length > 0 && (
                        <div>
                            <div
                                className="mb-20 "
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
                </div>

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic-form" layout="vertical" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off" form={form}>
                        <Form.Item label="Customer Name" name="customer" required={false} rules={[{ required: true, message: 'Please select customer name!' }]}>
                            <Select
                                onChange={handleSelectChange}
                                placeholder="Select a customer"
                                value={selectedCustomerId}
                                showSearch
                                filterOption={(input, option: any) =>
                                    option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0 || option.props.children.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                                }
                            >
                                {customerList?.map((val: any) => (
                                    <Select.Option key={val.id} value={val.id}>
                                        {val.customer_name} - {val.phone_no}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {/* <Form.Item>
                            <Input.TextArea rows={4} value={customerAddress} />
                        </Form.Item> */}

                        <Form.Item label="Discount (%)" name="discount" required={false} rules={[{ required: true, message: 'Please enter discount !' }]}>
                            <Input type="number" placeholder="Discount" />
                        </Form.Item>

                        <Form.Item>
                            {/* <Space> */}
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
                            {/* <Button htmlType="submit" style={{ borderColor: "blue", color: "blue" }}>
                                        Add Invoice Test
                                    </Button> */}
                            {/* </Space> */}
                        </Form.Item>
                        {/* </div> */}
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

export default Discount;
