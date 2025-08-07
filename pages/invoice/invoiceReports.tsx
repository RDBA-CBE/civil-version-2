import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Space, Form, Button, message, Modal, Select } from 'antd';
import 'react-quill/dist/quill.snow.css';
import { baseUrl, Dropdown, ObjIsEmpty, useSetState } from '@/utils/function.util';
import CustomSelect from '@/components/Select';
import Models from '@/imports/models.import';

export default function InvoiceReports() {
    const editorRef: any = useRef();
    const router = useRouter();
    const { id } = router.query;
    const [form] = Form.useForm();

    const { CKEditor, ClassicEditor } = editorRef.current || {};

    const [messageApi, contextHolder] = message.useMessage();

    const [state, setState] = useSetState({
        employeeList: [],
        employeeHasNext: null,
        employeeCurrentPage: null,
        employeeList1: [],
        employeeHasNext1: null,
        employeeCurrentPage1: null,
        editorLoad: false,
        invoiceData: {},
        editor: '<p>Your HTML content here</p>',
        completed: null,
        isOpen: false,
        btnLoading: false,
    });

    useEffect(() => {
        editorRef.current = {
            CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
            ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
        };
        setState({ editorLoad: true });
    }, []);

    useEffect(() => {
        getTestReport();
    }, [id]);

    useEffect(() => {
        getTestReport();
        employeeList(1);
    }, []);

    const getTestReport = async () => {
        try {
            const res: any = await Models.invoice.getTest(id);
            setState({
                invoiceData: res?.invoice,
                completed: res?.completed,
                completed1: res?.completed,
                invoiceTest: res,
                editor: res?.report_template,
            });

            if (res?.primary_authorised_signature) {
                setState({
                    employeeLeft: { label: 'Authorized Signature', value: 'authorized signature' },
                    employeeLeft1: { label: 'Authorized Signature', value: 'authorized signature' },
                });
            } else {
                setState({
                    employeeLeft: res?.primary_signature ? { value: res?.primary_signature?.id, label: res?.primary_signature?.employee_name } : null,
                    employeeLeft1: res?.primary_signature ? { value: res?.primary_signature?.id, label: res?.primary_signature?.employee_name } : null,
                });
            }

            if (res?.secondary_authorised_signature) {
                setState({
                    employeeRight: { label: 'Authorized Signature', value: 'authorized signature' },
                    employeeRight1: { label: 'Authorized Signature', value: 'authorized signature' },
                });
            } else {
                setState({
                    employeeRight: res?.secondary_signature ? { value: res?.secondary_signature?.id, label: res?.secondary_signature?.employee_name } : null,
                    employeeRight1: res?.secondary_signature ? { value: res?.secondary_signature?.id, label: res?.secondary_signature?.employee_name } : null,
                });
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const employeeList = async (page = 1) => {
        try {
            const res: any = await Models.customer.isActiveEmployeeList(page, null);
            const dropdown = Dropdown(res?.results, 'employee_name');
            setState({ employeeList: dropdown, employeeHasNext: res?.next, employeeCurrentPage: page, employeeList1: dropdown, employeeHasNext1: res?.next, employeeCurrentPage1: page });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const employeeSearch = async (text: any, type: any) => {
        try {
            const body = {
                search: text,
            };
            const res: any = await Models.customer.isActiveEmployeeList(1, body);

            if (res?.results?.length > 0) {
                const dropdown = Dropdown(res?.results, 'employee_name');
                if (type == 'left') {
                    setState({ employeeList: dropdown, employeeHasNext: res?.next, employeeCurrentPage: 1, search: text });
                } else {
                    setState({ employeeList1: dropdown, employeeHasNext1: res?.next, employeeCurrentPage1: 1, search1: text });
                }
            }
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const employeeLoadMore = async (page = 1, type: any) => {
        try {
            const body = {
                search: state.search,
            };
            const res: any = await Models.customer.isActiveEmployeeList(page, body);
            const dropdown = Dropdown(res?.results, 'employee_name');

            if (type == 'left') {
                setState({ employeeList: [...state.employeeList, ...dropdown], employeeHasNext: res?.next, employeeCurrentPage: page });
            } else {
                setState({ employeeList1: [...state.employeeList1, ...dropdown], employeeHasNext1: res?.next, employeeCurrentPage1: page });
            }
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const handleUpdate = async () => {
        try {
            setState({ btnLoading: true });
            const body: any = {
                completed: state.completed,
            };

            if (state.employeeLeft?.value == 'authorized signature') {
                body.primary_authorised_signature = true;
                body.primary_signature = null;
            } else {
                body.primary_authorised_signature = false;
                body.primary_signature = state.employeeLeft?.value;
            }

            if (state.employeeRight?.value == 'authorized signature') {
                body.secondary_authorised_signature = true;
                body.secondary_signature = null;
            } else {
                body.secondary_authorised_signature = false;
                body.secondary_signature = state.employeeRight?.value;
            }

            const res: any = await Models.invoice.updateTest(id, body);
            setState({ btnLoading: false });
            await getTestReport();
        } catch (error: any) {
            setState({ btnLoading: false });

            console.log('✌️error --->', error);
        }
    };

    const testUpdate = async (value: any, direction: string) => {
        try {
            const body: any = {
                completed: state.completed,
            };
            if (direction == 'left') {
                if (value?.value == 'authorized signature') {
                    body.primary_authorised_signature = true;
                    body.primary_signature = null;
                } else {
                    body.primary_authorised_signature = false;
                    body.primary_signature = value?.value;
                }
            } else {
                if (value?.value == 'authorized signature') {
                    body.secondary_authorised_signature = true;
                    body.secondary_signature = null;
                } else {
                    body.secondary_authorised_signature = false;
                    body.secondary_signature = value?.value;
                }
            }

            const res: any = await Models.invoice.updateTest(id, body);
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            setState({ btn2Loading: true });
            let without_primary_signature = false;
            let without_secondary_signature = false;

            if (values?.signature) {
                if (values?.signature == 'with-signature') {
                    if (values?.signature1 == 'with-signature') {
                        without_primary_signature = false;
                        without_secondary_signature = false;
                    } else {
                        without_primary_signature = false;
                        without_secondary_signature = true;
                    }
                } else if (values?.signature == 'without-signature') {
                    if (values?.signature1 == 'with-signature') {
                        without_primary_signature = true;
                        without_secondary_signature = false;
                    } else {
                        without_primary_signature = true;
                        without_secondary_signature = true;
                    }
                }
            } else {
                if (values?.signature1 == 'with-signature') {
                    without_primary_signature = false;
                    without_secondary_signature = false;
                } else if (values?.signature1 == 'without-signature') {
                    without_primary_signature = false;
                    without_secondary_signature = true;
                }
            }

            const body = {
                without_primary_signature,
                without_secondary_signature,
            };

            const res: any = await Models.invoice.updateTest(id, body);
            setState({ btn2Loading: false, isOpen: false });

            let url = `/invoice/print4?id=${id}`;
            window.open(url, '_blank');
        } catch (error: any) {
            setState({ btn2Loading: false });
            console.log('✌️error --->', error);
        }
    };

    const goBack = () => {
        window.location.href = `/invoice/edits?id=${state.invoiceData?.id}`;
    };

    const inputChange = (e: any) => {
        setState({
            [e.target.name]: e.target.value,
        });
    };

    const handlePrint1 = () => {
        if (state.employeeLeft?.value == 'authorized signature' && state.employeeRight?.value == 'authorized signature') {
            var id: any = state.invoiceTest.id;
            var url = `/invoice/print3?id=${id}`;

            window.open(url, '_blank');
        } else {
            setState({ isOpen: true });
        }
    };

    const handlePrint = async () => {
        try {
            setState({ printLoading: true });
            const body = {
                without_primary_signature: false,
                without_secondary_signature: false,
            };

            const res: any = await Models.invoice.updateTest(id, body);
            setState({ printLoading: false });

            let url = `/invoice/print?id=${id}`;

            window.open(url, '_blank');
            setState({ printLoading: false });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const disableBtn = () => {
        let isDisable = true;
        if (state?.completed1 == 'Yes' && state.employeeRight1 && state.employeeLeft1) {
            isDisable = false;
        }
        return isDisable;
    };
    return (
        <>
            <div className="panel" style={{ margin: '30px' }}>
                <div style={{ textAlign: 'end' }}>
                    <Button type="primary" onClick={() => goBack()}>
                        {' '}
                        Go Back{' '}
                    </Button>
                </div>

                <div>
                    {contextHolder}
                    <Form name="basic" layout="vertical" form={form} onFinish={() => handleUpdate()} autoComplete="off">
                        <Form.Item label="Edit Report Template" name="report_template" required={false}>
                            <div dangerouslySetInnerHTML={{ __html: state.editor }} style={{ display: 'none' }} />
                            {state.editorLoad && (
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={state.editor}
                                    onChange={(event: any, editor: any) => {
                                        const data = editor.getData();
                                        setState({ editor: data });
                                    }}
                                />
                            )}
                        </Form.Item>
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                Completed
                            </label>
                            <div className="mt-0 flex items-center  font-semibold ">
                                <input id="swift-code-yes" type="radio" name="completed" value="Yes" onChange={inputChange} checked={state?.completed === 'Yes'} />
                                <label style={{ marginRight: '3px', marginBottom: '0px' }}>Yes</label>

                                <input id="swift-code-no" type="radio" name="completed" value="No" onChange={inputChange} checked={state?.completed === 'No'} style={{ marginLeft: '20px' }} />
                                <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                            </div>
                        </div>
                        <div className="flex w-full gap-5">
                            <div style={{ marginBottom: '20px' }} className="w-[50%]">
                                <label htmlFor="yourSelect">Employee Name (Left Side)</label>

                                <CustomSelect
                                    onSearch={(data: any) => employeeSearch(data, 'left')}
                                    value={state.employeeLeft}
                                    options={[...(state.employeeList || []), { label: 'Authorized Signature', value: 'authorized signature' }]}
                                    className="flex-1"
                                    loadMore={() => {
                                        if (state.employeeHasNext) {
                                            employeeLoadMore(state.employeeCurrentPage + 1, 'left');
                                        }
                                    }}
                                    isSearchable
                                    onChange={(selectedOption: any) => {
                                        setState({ employeeLeft: selectedOption });
                                        testUpdate(selectedOption, 'left');
                                    }}
                                    isClearable={false}
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }} className="w-[50%]">
                                <label htmlFor="yourSelect">Employee Name (Right Side)</label>

                                <CustomSelect
                                    onSearch={(data: any) => employeeSearch(data, 'right')}
                                    value={state.employeeRight}
                                    options={[...(state.employeeList1 || []), { label: 'Authorized Signature', value: 'authorized signature' }]}
                                    className="flex-1"
                                    loadMore={() => {
                                        if (state.employeeHasNext1) {
                                            employeeLoadMore(state.employeeCurrentPage1 + 1, 'right');
                                        }
                                    }}
                                    isSearchable
                                    onChange={(selectedOption: any) => {
                                        setState({ employeeRight: selectedOption });
                                        testUpdate(selectedOption, 'right');
                                    }}
                                    isClearable={false}
                                    filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                />
                            </div>
                        </div>
                        <Form.Item>
                            <div className="form-btn-main">
                                <Space>
                                    <Button type="primary" onClick={() => handlePrint()} disabled={disableBtn()} loading={state.printLoading}>
                                        Print
                                    </Button>
                                    <Button type="primary" onClick={() => handlePrint1()} disabled={disableBtn()}>
                                        Print Without Header
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={state.btnLoading}>
                                        Update
                                    </Button>
                                </Space>
                            </div>
                        </Form.Item>
                    </Form>
                </div>

                <Modal title="Select Signature Option" open={state.isOpen} onOk={() => setState({ isOpen: false })} onCancel={() => setState({ isOpen: false })} footer={false}>
                    <Form name="basic-1" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={handleSubmit} autoComplete="off">
                        {state.employeeLeft?.value != 'authorized signature' && (
                            <Form.Item label="Signature Employee Left" name="signature" required={true} rules={[{ required: true, message: 'Please Select Signature Option!' }]}>
                                <Select>
                                    <Select.Option value="with-signature">With Signature</Select.Option>
                                    <Select.Option value="without-signature">Without Signature</Select.Option>
                                </Select>
                            </Form.Item>
                        )}
                        {state.employeeRight?.value != 'authorized signature' && (
                            <Form.Item label="Signature Employee Right" name="signature1" required={true} rules={[{ required: true, message: 'Please Select Signature Option!' }]}>
                                <Select>
                                    <Select.Option value="with-signature">With Signature</Select.Option>
                                    <Select.Option value="without-signature">Without Signature</Select.Option>
                                </Select>
                            </Form.Item>
                        )}

                        <Form.Item>
                            <div className="form-btn-main">
                                <Space>
                                    <Button danger htmlType="submit" onClick={() => setState({ isOpen: false })}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={state.btn2Loading}>
                                        Submit
                                    </Button>
                                </Space>
                            </div>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </>
    );
}
