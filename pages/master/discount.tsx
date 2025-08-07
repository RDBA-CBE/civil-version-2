import React, { useState, useEffect } from 'react';
import { Space, Table, Modal, Spin, Select } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input } from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';
import { baseUrl, Dropdown, Failure, Success, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import ExcelJS from 'exceljs';
import * as FileSaver from 'file-saver';
import IconLoader from '@/components/Icon/IconLoader';
import CustomSelect from '@/components/Select';
import { scrollConfig } from '@/utils/constant';

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
        customerCurrentPage: 1,
        customerHasNext: null,
        customerList: [],
    });

    // get Tax datas
    useEffect(() => {
        getCustomerDiscount(state.currentPage);
        customersList(1);
        role();
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

    const role = async () => {
        try {
            setState({ loading: true });
            const data = localStorage.getItem('admin');
            let isAdmin = false;
            if (data) {
                try {
                    const parsedData = JSON.parse(data);
                    isAdmin = !!parsedData; // Convert to boolean
                } catch (parseError) {
                    console.error('Error parsing admin data:', parseError);
                    isAdmin = false;
                }
            }
            setState({ isAdmin, loading: false });
        } catch (error) {
            setState({ loading: false });
        }
    };

    const customersList = async (page = 1) => {
        try {
            const res: any = await Models.invoice.customerList(page);
            const dropdown = Dropdown(res?.results, 'customer_name');
            setState({ customerList: [...state.customerList, ...dropdown], customerHasNext: res?.next, customerCurrentPage: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const customerSearch = async (text: any) => {
        try {
            const res: any = await Models.invoice.customerSearch(text);
            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'customer_name');
                setState({ customerList: dropdown, customerHasNext: res?.next, customerCurrentPage: 1 });
            }
        } catch (error) {
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

    // drawer
    const showDrawer = async (record: any) => {
        try {
            if (record) {
                const body = {
                    customer: { value: record?.customer?.id, label: record?.customer?.customer_name },
                    id: record?.id,
                    discount: record?.discount,
                };

                setEditRecord(body);
                form.setFieldsValue(body);
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
        ...(state.isAdmin
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

    // form submit
    const onFinish = async (values: any) => {
        try {
            setState({ btnLoading: true });
            const body = {
                customer: values.customer?.value,
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

    const handlePageChange = (number: any) => {
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
                            spinning: state.loading,
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...',
                        }}
                    />
                    {state.discountList?.length > 0 && (
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
                </div>

                <Drawer title={drawerTitle} placement="right" width={600} onClose={onClose} open={open}>
                    <Form name="basic-form" layout="vertical" initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off" form={form}>
                        <Form.Item label="Customer Name" name="customer" required={false} rules={[{ required: true, message: 'Please select customer name!' }]}>

                            <CustomSelect
                                onSearch={(data: any) => customerSearch(data)}
                                value={state.customer}
                                options={state.customerList}
                                className=" flex-1"
                                onChange={(selectedOption: any) => {
                                    form.setFieldsValue({ customer: selectedOption });
                                    customersList(1);
                                }}
                                loadMore={() => {
                                    if (state.customerHasNext) {
                                        customersList(state.customerCurrentPage + 1);
                                    }
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        <Form.Item label="Discount (%)" name="discount" required={false} rules={[{ required: true, message: 'Please enter discount !' }]}>
                            <Input type="number" placeholder="Discount" />
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
            </div>
        </>
    );
};

export default Discount;
