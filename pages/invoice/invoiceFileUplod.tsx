import React, { useState, useEffect, useRef } from 'react';
import { Space, Table, Modal, DatePicker, Button, Drawer, Form, Input, message, Upload, Select, Spin } from 'antd';
import { EditOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import axios from 'axios';
import type { UploadProps } from 'antd';
import router from 'next/router';
import dayjs from 'dayjs';
import { baseUrl, ObjIsEmpty, useSetState } from '@/utils/function.util';
import Pagination from '@/components/pagination/pagination';
import Models from '@/imports/models.import';
import { scrollConfig } from '@/utils/constant';

const InvoiceFileUpload = () => {
    const { Search } = Input;
    const [form] = Form.useForm();
    const fileInputRef: any = useRef(null);

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create File Upload');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [dataSource, setDataSource] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formFields, setFormFields] = useState<any>([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [fileshow, setFileShow] = useState<any>('');
    const [errorMessage, setErrorMessage] = useState('');
    const [fileInputData, setFileInputData] = useState<any>({
        file: null,
    });
    const [loading, setLoading] = useState(false);

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        invoiceFileList: [],
        discount: 0,
        searchValue: null,
    });

    useEffect(() => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/create_invoice_file_upload/`, {
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
    }, []);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit File Upload');
        } else {
            setDrawerTitle('Create File Upload');
        }
    }, [editRecord, open]);

    // get Tax datas
    // useEffect(() => {
    //     getFileUpload();
    // }, []);

    // const getFileUpload = () => {
    //     const Token = localStorage.getItem('token');

    //     axios
    //         .get('${baseUrl}/invoice_file_upload_list/', {
    //             headers: {
    //                 Authorization: `Token ${Token}`,
    //             },
    //         })
    //         .then((res) => {
    //             setDataSource(res?.data?.invoice_files);
    //             setFilterData(res?.data?.invoice_files);
    //         })
    //         .catch((error: any) => {
    //             if (error.response.status === 401) {
    //                 router.push('/');
    //             } else {
    //             }
    //         });
    // };

    const handleCategoryChange = (value: any) => {
        setSelectedCategory(value);
        form.resetFields(['invoice', 'expense']);
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
        if (record && record.id !== editRecord?.id) {
            removeFile();
        }

        if (record) {
            setFileShow(record.file_url);
            setEditRecord(record);
            setSelectedCategory(record.category);
            form.setFieldsValue({
                invoice: record.invoice,
                category: record.category,
                expense: record.expense,
            });
            setFileInputData({ ...fileInputData, file: fileInputData?.file?.name });
        } else {
            setEditRecord(null);
            form.resetFields();
            setFileShow(null);
            setErrorMessage('');
            setFileInputData(null);
            removeFile();
        }
        setOpen(true);
    };

    //  const invoiceList:any = async (page = 1) => {
    //     try {
    //         const res: any = await Models.invoice.invoiceList(page);

    //         console.log('res', res);
    //         const updatedResults = res.results?.map((item: any) => ({
    //             ...item,
    //             combined_label: `${item.invoice_no} - ${item.customer.customer_name} - ${item.customer.phone_no}`,
    //         }));

    //         console.log('updatedResults', updatedResults);

    //         const dropdown = Dropdown(updatedResults, 'combined_label');

    //         console.log('dropdown', dropdown);

    //         setState({ invoiceList: dropdown, invoiceHasNext: res?.next, invoiceCurrentPage: page });
    //     } catch (error: any) {
    //         console.log('✌️error --->', error);
    //     }
    // };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
        setFileShow('');
        setErrorMessage('');
        setFileInputData(null);
        removeFile();
    };

    const columns = [
        {
            title: 'Id',
            dataIndex: 'id',
            key: 'id',
            className: 'singleLineCell',
        },
        {
            title: 'Category',
            dataIndex: 'category_name',
            key: 'category_name',
            className: 'singleLineCell',
        },
        {
            title: 'Invoice No',
            dataIndex: 'invoice_no',
            key: 'invoice_no',
            className: 'singleLineCell',
            render: (text: any, record: any) => (text ? text : 'N/A'),
        },
        {
            title: 'Expense',
            dataIndex: 'expense_category',
            key: 'expense_category',
            className: 'singleLineCell',
        },
        {
            title: 'File Url',
            dataIndex: 'file_url',
            key: 'file_url',
            className: 'singleLineCell',
            render: (text: any, record: any) => (
                <Space size="middle">
                    <a href={record.file_url} download target="_blank" rel="noopener noreferrer">
                        Download
                    </a>
                </Space>
            ),
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
          <DeleteOutlined
            style={{ color: "red", cursor: "pointer" }}
            onClick={() => handleDelete(record)} className='delete-icon' rev={undefined} /> */}
                </Space>
            ),
        },
    ];

    // input search
    // const inputChange = (e: any) => {
    //     setFilterData(
    //         dataSource.filter((item: any) => {
    //             return (
    //                 item.category_name.toLowerCase().includes(e.target.value.toLowerCase()) ||
    //                 item?.expense_category?.toLowerCase().includes(e.target.value.toLowerCase()) ||
    //                 item?.invoice_no?.includes(e.target.value)
    //             );
    //         })
    //     );
    // };
    // console.log('fileInputData', fileInputData.file);

    // form submit
    const onFinish = (values: any) => {

        const Token = localStorage.getItem('token');

        // Append the file from the values object
        const formData = new FormData();
        formData.append('file', fileInputData.file);

        if (values.invoice !== undefined) {
            formData.append('invoice', values.invoice);
        }
        formData.append('category', values.category);
        if (values.expense !== undefined) {
            formData.append('expense', values.expense);
        }


        if (editRecord) {
            axios
                .put(`${baseUrl}/edit_invoice_file_upload/${editRecord.id}/`, formData, {
                    headers: {
                        Authorization: `Token ${Token}`,
                        'Content-Type': 'multipart/form-data', // Set content type for file upload
                    },
                })
                .then((res: any) => {
                    initialData(1);
                    setOpen(false);
                    onClose();
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });
        } else {
            axios
                .post(`${baseUrl}/create_invoice_file_upload/`, formData, {
                    headers: {
                        Authorization: `Token ${Token}`,
                        'Content-Type': 'multipart/form-data', // Set content type for file upload
                    },
                })
                .then((res: any) => {
                    initialData(1);
                    setOpen(false);
                    setFileShow('');
                    onClose();
                })
                .catch((error: any) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    }
                });
            form.resetFields();
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

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
                label: 'Category:',
                value: viewRecord?.category_name || 'N/A',
            },
            {
                label: 'Invoice:',
                value: viewRecord?.invoice || 'N/A',
            },
            {
                label: 'Expense:',
                value: viewRecord?.expense_category || 'N/A',
            },
            {
                label: 'Download:',
                value: viewRecord?.file_url || 'N/A',
            },

            {
                label: 'Created By:',
                value: viewRecord?.created_by || 'N/A',
            },
            {
                label: 'Created Date:',
                value: formatDate(viewRecord?.created_date) || 'N/A',
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


    const removeFile = () => {
        setFileShow('');
        setFileInputData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const selectFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            const fileType = file.type;
            const fileSize = file.size / 1024 / 1024; // Convert size to MB
            if (fileType === 'application/pdf' || fileType.includes('spreadsheet')) {
                if (fileSize <= 2) {
                    setFileInputData({ file });
                    setErrorMessage('');
                } else {
                    // Display error message or handle the invalid file size
                    console.log('File size exceeds the limit of 2 MB.');
                    setErrorMessage('File size exceeds the limit of 2 MB.');
                    setFileInputData(null);
                }
            } else {
                // Display error message or handle the invalid file type
                console.log('Invalid file type. Please select a PDF or Excel sheet file.');
            }
        }
    };

    const url = fileshow;
    const filenames = url.substring(url.lastIndexOf('/') + 1); // Extracts the filename from the URL
    const fileType = filenames.substring(filenames.lastIndexOf('.') + 1);

    // search

    useEffect(() => {
        initialData(1);
    }, []);

    const initialData = async (page: any) => {
        try {
            setState({ loading: true });

            const res: any = await Models.invoiceFile.invoiceFileList(page);
            setState({
                invoiceFileList: res?.results,
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
            if (state.searchValue?.category) {
                body.category_name = state.searchValue.category_name;
            }
            if (state.searchValue?.from_date) {
                body.from_date = state.searchValue.from_date;
            }

            if (state.searchValue?.to_date) {
                body.to_date = state.searchValue.to_date;
            }
            if (state.searchValue?.invoice_no) {
                body.invoice_no = state.searchValue.invoice_no;
            }
        }

        return body;
    };

    // form submit
    const onFinish2 = async (values: any, page = 1) => {
        try {
            const body = {
                invoice_no: values.invoice_no ? values.invoice_no : '',
                from_date: values?.from_date ? dayjs(values?.from_date).format('YYYY-MM-DD') : '',
                to_date: values?.to_date ? dayjs(values?.to_date).format('YYYY-MM-DD') : '',
                category_name: values.category ? values.category : '',
            };


            const res: any = await Models.invoiceFile.filter(body, page);
            setState({
                invoiceFileList: res?.results,
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
                            <Form.Item label="Invoice No" name="invoice_no" style={{ width: '200px' }}>
                                <Input />
                            </Form.Item>

                            <Form.Item label="Category" name="category" style={{ width: '250px' }}>
                                <Select showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {formFields?.categories?.map((value: any) => {

                                        return (
                                            <Select.Option key={value.id} value={value.id}>
                                                {value.name}
                                            </Select.Option>
                                        );
                                    })}
                                </Select>
                            </Form.Item>

                            <Form.Item label="From Date" name="from_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            <Form.Item label="To Date" name="to_date" style={{ width: '200px' }}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>

                            {/* <Form.Item label="Completed Test" name="completed" style={{ width: '200px' }}>
                                <Select>
                                    <Select.Option value="Yes">Yes</Select.Option>
                                    <Select.Option value="No">No</Select.Option>
                                </Select>
                            </Form.Item> */}

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
                        <h1 className="text-lg font-semibold dark:text-white-light">Expense/Invoice File Upload</h1>
                    </div>
                    <div>
                        {/* <Search placeholder="Input search text" onChange={inputChange} enterButton className="search-bar" /> */}
                        <button
                            type="button"
                            onClick={() => {
                                showDrawer(null);
                            }}
                            className="create-button"
                        >
                            + File Upload
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={state.invoiceFileList}
                        columns={columns}
                        pagination={false}
                        scroll={scrollConfig}
                        loading={{
                            spinning: loading, // This enables the loading spinner
                            indicator: <Spin size="large" />,
                            tip: 'Loading data...', // Custom text to show while loading
                        }}
                    />
                </div>

                {state.invoiceFileList?.length > 0 && (
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
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item label="Category" name="category" required={true} rules={[{ required: true, message: 'Category field is required.' }]}>
                            <Select placeholder="Select a Category" onChange={handleCategoryChange}>
                                {formFields?.categories?.map((val: any) => (
                                    <Select.Option key={val.id} value={val.id}>
                                        {val.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        {selectedCategory === 2 && (
                            <Form.Item label="Invoice" name="invoice" required={true} rules={[{ required: true, message: 'Invoice field is required.' }]}>
                                <Select placeholder="Select an Invoice">
                                    {formFields?.invoices?.map((val: any) => (
                                        <Select.Option key={val.id} value={val.id}>
                                            {val.invoice_no} - {val.customer} - {val.customer_no}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}

                        {selectedCategory === 3 && (
                            <Form.Item label="Expense Entry" name="expense" required={true} rules={[{ required: true, message: 'Expense field is required.' }]}>
                                <Select placeholder="Select an Expense Entry">
                                    {formFields?.expense_entries?.map((val: any) => (
                                        <Select.Option key={val.id} value={val.id}>
                                            {val.expense_user} - {val.expense_category_name} - {val.amount}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        )}

                        <label>Invoice File Upload</label>
                        {fileshow ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p style={{ padding: '5px 20px', border: '1px solid #d9d9d9', borderRadius: '7px' }}>{filenames}</p>
                                    <Button onClick={() => removeFile()}>Remove File</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <input id="file" type="file" ref={fileInputRef} name="file" accept=".pdf, .xls, .xlsx" onChange={selectFileChange} required />
                                <p style={{ color: 'red' }}>{errorMessage}</p>
                            </>
                        )}

                        <Form.Item>
                            <div className="form-btn-main" style={{ marginTop: '20px' }}>
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

                {/* Modal */}
                <Modal title="View File" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
                    <div style={{ overflow: 'scroll' }}>
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
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default InvoiceFileUpload;
