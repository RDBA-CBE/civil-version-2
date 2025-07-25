import React, { useState, useEffect, useRef } from 'react';
import { Space, Table, Modal, message, InputNumber, Spin } from 'antd';
import { Button, Drawer } from 'antd';
import { Form, Input, Radio, DatePicker } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import router from 'next/router';
import { baseUrl, useSetState } from '@/utils/function.util';
import IconMenuAuthentication from '@/components/Icon/Menu/IconMenuAuthentication';
import IconLockDots from '@/components/Icon/IconLockDots';
import Models from '@/imports/models.import';
import Pagination from '@/components/pagination/pagination';
import useDebounce from '@/components/useDebounce/useDebounce';
import IconLoader from '@/components/Icon/IconLoader';
import { scrollConfig } from '@/utils/constant';

type FieldType = {
    employee_name?: string;
    username?: string;
    password?: string;
    address?: string;
    mobile_number?: string;
    dob?: string;
    gender?: string;
    qualification?: string;
    joiningDate?: string;
    salary?: string;
    branch_email?: string;
    role?: string;
};

const Employee = () => {
    const { Search } = Input;
    const [form] = Form.useForm();
    const { confirm } = Modal;

    const { TextArea } = Input;

    const fileInputRef: any = useRef(null);

    const [open, setOpen] = useState(false);
    const [editRecord, setEditRecord] = useState<any>(null);
    const [drawerTitle, setDrawerTitle] = useState('Create Employee');
    const [viewRecord, setViewRecord] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [dataSource, setDataSource] = useState([]);
    const [messageApi, contextHolder] = message.useMessage();
    const [fileshow, setFileShow] = useState<any>('');
    const [admin, setAdmin] = useState();
    const [loading, setLoading] = useState(false);
    const [isUpdatePassword, setIsUpdatePassword] = useState(false);
    const [filterData, setFilterData] = useState(dataSource);
    const [errorMessage, setErrorMessage] = useState('');
    const [fileInputData, setFileInputData] = useState<any>({
        signature: null,
    });

    const [state, setState] = useSetState({
        page: 1,
        pageSize: 10,
        total: 0,
        currentPage: 1,
        pageNext: null,
        pagePrev: null,
        search: '',
    });

    useEffect(() => {
        const Admin: any = localStorage.getItem('admin');
        setAdmin(Admin);
    }, []);

    useEffect(() => {
        getEmployee(1);
    }, []);
    const debouncedSearch = useDebounce(state.search);

    useEffect(() => {
        getEmployee(1);
    }, [debouncedSearch]);

    useEffect(() => {
        if (editRecord) {
            setDrawerTitle('Edit Employee');
        } else {
            setDrawerTitle('Create Employee');
        }
    }, [editRecord, open]);

    const getEmployee = async (page: any) => {
        try {
            setState({ loading: true });
            const body = bodyData();
            const res: any = await Models.customer.employeeList(page, body);
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

    const bodyData = () => {
        const body: any = {};
        if (state.search) {
            body.search = state.search;
        }
        return body;
    };

    const handlePageChange = (number: any) => {
        setState({ currentPage: number });
        getEmployee(number);

        return number;
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

    const removeFile = () => {
        setFileShow('');
        setFileInputData(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // drawer
    const showDrawer = (record: any) => {
        if (record && record.id !== editRecord?.id) {
            removeFile();
        }

        if (record) {
            setFileShow(record.signature);
            // if (record.signature) {
            //     convertUrlToFile(record.signature);
            // }
            const bodyData = {
                ...record,
                dob: dayjs(record.dob),
                joining_date: dayjs(record.joining_date),
            };
            setEditRecord(bodyData);
            form.setFieldsValue(bodyData);
        } else {
            setEditRecord(null);
            form.resetFields();
            setErrorMessage('');
            setFileInputData(null);
            removeFile();
        }

        setOpen(true);
    };

    const showPasswordDrawer = (record: any) => {
        setState({ employeeId: record.user, employee_name: record?.employee_name });

        setIsUpdatePassword(true);
    };

    const handleUpdatePassword = async () => {
        try {
            setState({ btnLoading: true });
            if (!state.new_password) {
                setState({ newPasswordError: true });
            } else if (!state.confirm_new_password) {
                setState({ confirmPasswordError: true });
            } else if (state.new_password !== state.confirm_new_password) {
                setState({ matchPasswordError: true });
            } else {
                const body = {
                    user_id: state.employeeId,
                    new_password: state.new_password,
                    confirm_new_password: state.confirm_new_password,
                };
                const res: any = await Models.auth.changeEmployeePassword(body);
                setState({
                    confirm_new_password: '',
                    showPassword1: false,
                    new_password: '',
                    showNewPassword: false,
                    employeeId: '',
                    confirmPasswordError: '',
                    newPasswordError: false,
                    matchPasswordError: false,
                    btnLoading: false,
                });
                setIsUpdatePassword(false);
                messageApi.open({
                    type: 'success',
                    content: res?.detail,
                });
            }
        } catch (error: any) {
            setState({ btnLoading: false });
            if (error?.detail) {
                messageApi.open({
                    type: 'error',
                    content: error?.detail,
                });
            }
        }
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
        setErrorMessage('');
        setFileInputData(null);
        removeFile();
    };

    // table
    const columns = [
        {
            title: 'Employee Name',
            dataIndex: 'employee_name',
            key: 'employee_name',
            className: 'singleLineCell',
        },
        {
            title: 'User Name',
            dataIndex: 'username',
            key: 'username',
            className: 'singleLineCell',
        },

        {
            title: 'Mobile Number',
            dataIndex: 'mobile_number',
            key: 'mobile_number',
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
                        <>
                            <EditOutlined style={{ cursor: 'pointer' }} onClick={() => showDrawer(record)} className="edit-icon" rev={undefined} />
                            <IconMenuAuthentication style={{ cursor: 'pointer' }} onClick={() => showPasswordDrawer(record)} className="edit-icon" />
                        </>
                    ) : (
                        <EditOutlined style={{ cursor: 'pointer', display: 'none' }} onClick={() => showDrawer(record)} className="edit-icon" rev={undefined} />
                    )}
                    {record?.is_active ? (
                        <CheckCircleOutlined
                            onClick={() => showDeleteConfirm(record)}
                            style={{
                                fontSize: '20px',
                                color: 'green',
                                paddingLeft: '8px',
                                cursor: 'pointer',
                            }}
                        />
                    ) : (
                        <CloseCircleOutlined
                            onClick={() => showDeleteConfirm(record)}
                            style={{
                                fontSize: '20px',
                                color: 'red',
                                paddingLeft: '8px',
                                cursor: 'pointer',
                            }}
                        />
                    )}
                    {/* <EditOutlined
                        style={{ cursor: "pointer" }}
                        onClick={() => showDrawer(record)}
                        className='edit-icon' rev={undefined} /> */}
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

    const showDeleteConfirm = (record: any) => {
        const Token = localStorage.getItem('token');

        confirm({
            title: record.is_active ? 'Are you sure you want to InActive this Employee?' : 'Are you sure you want to Active this Employee?',
            okText: record.is_active ? 'InActive' : 'Active',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
                setState({ loading: true });
                axios
                    .patch(
                        `${baseUrl}/employees/${record.id}/update/`,
                        {
                            is_active: !record.is_active,
                        },
                        {
                            headers: {
                                Authorization: `Token ${Token}`,
                            },
                        }
                    )
                    .then((response) => {
                        getEmployee(1);
                    })
                    .catch((error) => {
                        console.log('✌️error --->', error);
                        if (error.response.status === 401) {
                            router.push('/');
                        }
                    });
            },
            onCancel() {
            },
        });
    };

    // input search

    const selectFileChange = (e: any) => {
        const file = e.target.files[0];
        if (file) {
            setFileInputData(file);
        }
    };

    const url = fileshow;
    const filenames = url?.substring(url.lastIndexOf('/') + 1);

    // form submit
    const onFinish = (values: any) => {
        const Token = localStorage.getItem('token');
        const formData: any = new FormData();

        // Append the non-file form fields to the FormData
        if (values.employee_name) {
            formData.append('employee_name', values.employee_name);
        }
        if (values.username) {
            formData.append('username', values.username);
        }
        if (values.password) {
            formData.append('password', values.password);
        }
        if (values.address) {
            formData.append('address', values.address);
        }
        if (values.mobile_number) {
            formData.append('mobile_number', values.mobile_number);
        }
        if (values.branch_email) {
            formData.append('branch_email', values.branch_email);
        }
        if (values.role) {
            formData.append('role', values.role);
        }

        if (values.dob) {
            formData.append('dob', dayjs(values.dob).format('YYYY-MM-DD')); // Format date before appending
        }
        if (values.joining_date) {
            formData.append('joining_date', dayjs(values.joining_date).format('YYYY-MM-DD')); // Format date before appending
        }
        if (values.gender) {
            formData.append('gender', values.gender);
        }
        if (values.qualification) {
            formData.append('qualification', values.qualification);
        }
        if (values.salary) {
            formData.append('salary', values.salary);
        }
        if (values.branch_email) {
            formData.append('branch_email', values.branch_email);
        }

        // Append the signature file if exists
        if (fileInputData) {
            formData.append('signature', fileInputData);
        } else {
            formData.append('signature', null);
        }

        if (fileInputData == undefined || fileInputData == null) {
            setErrorMessage('Please input your signature!');
        }

        // Determine the request URL (whether creating or editing an employee)
        const apiUrl = editRecord ? `${baseUrl}/edit_employee/${editRecord.id}/` : `${baseUrl}/create_employee/`;

        // Perform the API call (POST for create, PUT for edit)
        const method = editRecord ? 'put' : 'post';
        axios[method](apiUrl, formData, {
            headers: {
                Authorization: `Token ${Token}`,
                'Content-Type': 'multipart/form-data', // Make sure to set this header for file uploads
            },
        })
            .then((res) => {
                getEmployee(1); // Refresh employee data
                form.resetFields(); // Reset the form
                onClose(); // Close the drawer
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                } else {
                    messageApi.open({
                        type: 'error',
                        content: `${error?.response?.data?.user?.username}`,
                    });
                }
            });

        // Clear editRecord state after successful operation
        setEditRecord(null);
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
                label: 'Employee Name:',
                value: viewRecord?.employee_name || 'N/A',
            },
            {
                label: 'User Name:',
                value: viewRecord?.username || 'N/A',
            },
            {
                label: 'Branch Email:',
                value: viewRecord?.branch_email || 'N/A',
            },
            {
                label: 'Date Of Birth:',
                value: formatDate(viewRecord?.dob) || 'N/A',
            },
            {
                label: 'Gender:',
                value: viewRecord?.gender_name || 'N/A',
            },
            {
                label: 'Mobile Number:',
                value: viewRecord?.mobile_number || 'N/A',
            },
            {
                label: 'Qualification:',
                value: viewRecord?.qualification || 'N/A',
            },
            {
                label: 'Salary:',
                value: viewRecord?.salary || 'N/A',
            },
            {
                label: 'Date Of Joining:',
                value: formatDate(viewRecord?.joining_date) || 'N/A',
            },
            {
                label: 'Address:',
                value: viewRecord?.address || 'N/A',
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
            <div className="panel ">
                {contextHolder}
                <div className="tax-heading-main">
                    <div>
                        <h1 className="text-lg font-semibold dark:text-white-light">Employee Details</h1>
                    </div>
                    <div>
                        <Search placeholder="Input search text" value={state.search} onChange={(e) => setState({ search: e.target.value })} enterButton className="search-bar" />
                        <button type="button" onClick={() => showDrawer(null)} className="create-button">
                            + Create Employee{' '}
                        </button>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        dataSource={dataSource}
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
                        <Form.Item<FieldType> label="Employee Name" name="employee_name" required={true} rules={[{ required: true, message: 'Please input your Employee Name!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="User Name" name="username" required={true} rules={[{ required: true, message: 'Please input your User Name!' }]}>
                            <Input type="email" />
                        </Form.Item>

                        {drawerTitle === 'Create Employee' ? (
                            <Form.Item<FieldType> label="Password" name="password" required={true} rules={[{ required: true, message: 'Please input your Password!' }]}>
                                <Input.Password />
                            </Form.Item>
                        ) : (
                            <Form.Item<FieldType> label="Password" name="password" required={false} rules={[{ required: false, message: 'Please input your Password!' }]}>
                                <Input.Password />
                            </Form.Item>
                        )}

                        <Form.Item<FieldType> label="Designation" name="role" required={true} rules={[{ required: true, message: 'Please input your Designation!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item<FieldType> label="Address" name="address" required={true} rules={[{ required: true, message: 'Please input your Address!' }]}>
                            <TextArea rows={4} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Mobile Number" name="mobile_number" required={true} rules={[{ required: true, message: 'Please input your Mobile Number!' }]}>
                            <InputNumber style={{ width: '100%' }} maxLength={10} minLength={10} />
                        </Form.Item>

                        <Form.Item<FieldType> label="Branch Email" name="branch_email" required={true} rules={[{ required: true, message: 'Please input your Branch Email!' }]}>
                            <Input type="email" />
                        </Form.Item>

                        <Form.Item label="DOB" name="dob" required={true} rules={[{ required: true, message: 'Please Select your DOB!' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item label="Gender" name="gender" required={true} rules={[{ required: true, message: 'Please Select your Gender!' }]}>
                            <Radio.Group>
                                <Radio value="M"> Male </Radio>
                                <Radio value="F"> Female </Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item<FieldType> label="Qualification" name="qualification" required={true} rules={[{ required: true, message: 'Please input your Qualification!' }]}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Joining Date" name="joining_date" required={true} rules={[{ required: true, message: 'Please input Joining Date!' }]}>
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        {admin === 'true' ? (
                            <Form.Item<FieldType> label="Salary" name="salary" required={false} rules={[{ required: false, message: 'Please input your Salary (Allowed Numbers Only 0-9)!' }]}>
                                <InputNumber style={{ width: '100%' }} />
                            </Form.Item>
                        ) : null}

                        <label>
                            {' '}
                            <span style={{ color: 'red', paddingRight: '3px' }}>*</span>Signature
                        </label>
                        {fileshow ? (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <p style={{ padding: '5px 20px', border: '1px solid #d9d9d9', borderRadius: '7px' }}>{filenames}</p>
                                    <Button onClick={() => removeFile()}>Remove File</Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <input id="file" type="file" ref={fileInputRef} name="signature" accept="image/*" onChange={selectFileChange} required />
                                <p style={{ color: 'red' }}>{errorMessage}</p>
                            </>
                        )}
                        <Form.Item>
                            <div className="form-btn-main mt-5">
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
                <Modal title="View Employee" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} footer={false}>
                    {modalData().map((value: any, index: number) => (
                        <div className="content-main" key={index}>
                            {admin === 'true' || value.label !== 'Salary:' ? (
                                <>
                                    <p className="content-1">{value?.label}</p>
                                    <p className="content-2">{value?.value}</p>
                                </>
                            ) : null}
                        </div>
                    ))}
                </Modal>

                <Modal
                    title="Update Password"
                    open={isUpdatePassword}
                    onCancel={() => {
                        setState({
                            confirm_new_password: '',
                            showPassword1: false,
                            new_password: '',
                            showNewPassword: false,
                            employeeId: '',
                            confirmPasswordError: '',
                            newPasswordError: '',
                            matchPasswordError: false,
                        });
                        setIsUpdatePassword(false);
                    }}
                    footer={false}
                >
                    <div className="w-full max-w-[440px] lg:mt-16">
                        <form className="space-y-5 dark:text-white">
                            <div>
                                <label htmlFor="Password">Employee</label>
                                <div className="relative text-white-dark">
                                    <input
                                        required
                                        id="confirm_new_password"
                                        type={'text'}
                                        placeholder="Enter Confirm Password"
                                        className="form-input  placeholder:text-white-dark"
                                        name="confirm_new_password"
                                        value={state.employee_name}
                                        disabled={true}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="Password">New Password</label>
                                <div className="relative text-white-dark">
                                    <input
                                        required
                                        id="new_password"
                                        type={state.showNewPassword ? 'text' : 'password'}
                                        placeholder="Enter New Password"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                        name="new_password"
                                        value={state.new_password}
                                        onChange={(e) => setState({ new_password: e.target.value })}
                                    />

                                    <span className="absolute start-4 top-1/2 -translate-y-1/2" onClick={() => setState({ showNewPassword: !state.showNewPassword })} style={{ cursor: 'pointer' }}>
                                        <IconLockDots fill={true} />
                                    </span>
                                </div>
                                {state.newPasswordError == true && <div style={{ color: 'red', marginTop: '5px' }}>New Password is required.</div>}
                            </div>
                            <div>
                                <label htmlFor="Password">Confirm New Password</label>
                                <div className="relative text-white-dark">
                                    <input
                                        required
                                        id="confirm_new_password"
                                        type={state.showPassword1 ? 'text' : 'password'}
                                        placeholder="Enter Confirm Password"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                        name="confirm_new_password"
                                        value={state.confirm_new_password}
                                        onChange={(e) => setState({ confirm_new_password: e.target.value })}
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2" onClick={() => setState({ showPassword1: !state.showPassword1 })} style={{ cursor: 'pointer' }}>
                                        <IconLockDots fill={true} />
                                    </span>
                                </div>
                                {state.confirmPasswordError && <div style={{ color: 'red', marginTop: '5px' }}>Confirm Password is required.</div>}
                            </div>
                            {state.matchPasswordError && <div style={{ color: 'red', marginTop: '5px' }}>Password not matched.</div>}

                            <div style={{ display: 'flex' }}>
                                <button
                                    type="button"
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                    onClick={() => handleUpdatePassword()}
                                >
                                    {state.btnLoading ? <IconLoader className=" h-4 w-4 animate-spin" /> : 'Change Password'}
                                </button>
                                <button
                                    style={{ paddingRight: '10px' }}
                                    type="button"
                                    onClick={() => {
                                        setState({
                                            confirm_new_password: '',
                                            showPassword1: false,
                                            new_password: '',
                                            old_password: '',
                                            showNewPassword: false,
                                            employeeId: '',
                                            confirmPasswordError: '',
                                            newPasswordError: '',
                                            matchPasswordError: false,
                                            oldPasswordError: false,
                                        });
                                        setIsUpdatePassword(false);
                                    }}
                                    className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                >
                                    cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            </div>
        </>
    );
};

export default Employee;
