import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Space, Form, Button, message } from 'antd';
import 'react-quill/dist/quill.snow.css';
import { baseUrl } from '@/utils/function.util';

const InvoiceReport = () => {
    const editorRef: any = useRef();
    const router = useRouter();
    const { id } = router.query;
    const [form] = Form.useForm();

    const [editorLoaded, setEditorLoaded] = useState(false);
    const { CKEditor, ClassicEditor } = editorRef.current || {};
    const [invoiceReport, setInvoiceReport] = useState<any>([]);
    const [editor, setEditor] = useState<any>('<p>Your HTML content here</p>');
    const [messageApi, contextHolder] = message.useMessage();
    const [formData, setFormData] = useState<any>({
        completed: '',
        signature: '',
        is_authorised_signatory: false,
    });
    const [selectedId, setSelectedId] = useState<any>(1);

    useEffect(() => {
        editorRef.current = {
            CKEditor: require('@ckeditor/ckeditor5-react').CKEditor,
            ClassicEditor: require('@ckeditor/ckeditor5-build-classic'),
        };
        setEditorLoaded(true);
    }, []);

    useEffect(() => {
        getTestReport();
    }, [id]);

    useEffect(() => {
        getTestReport();
    }, []);

    const getTestReport = () => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/edit_invoice_test_template/${id}/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                const sampleObj = {
                    id: 1,
                    employee_name: 'Select employee ',
                };

                if (res.data.invoice_test.signature == null) {
                    res.data.signatures.unshift(sampleObj);
                }
                const resData = {
                    invoice: res.data.invoice,
                    invoice_test: res.data.invoice_test,
                    signatures: res.data.signatures,
                };

                setInvoiceReport(resData);

                setEditor(res.data.invoice_test.report_template);
                setSelectedId(1);
                if (res.data.invoice_test.signature == null) {
                    setFormData({
                        signature: 1,
                        completed: res.data.invoice_test.completed,
                        is_authorised_signatory: res.data.invoice_test?.is_authorised_signatory,
                    });
                }
                const filter = res.data.signatures.filter((element: any) => element.id == res.data.invoice_test.signature);
                setFormData({
                    signature: filter[0].id,
                    completed: res.data.invoice_test.completed,
                    is_authorised_signatory: res.data.invoice_test?.is_authorised_signatory,
                });
                setSelectedId(filter[0].id);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
    };

    // form submit
    const onFinish = (value: any) => {
        if (selectedId == 1 && formData.is_authorised_signatory == false) {
            messageApi.open({
                type: 'error',
                content: 'Please Select Employee Name',
            });
        } else {
            const body = {
                report_template: editor,
                completed: formData.completed,
                signature: formData.is_authorised_signatory == true ? '' : selectedId,
                is_authorised_signatory: formData.is_authorised_signatory,
            };

            const Token = localStorage.getItem('token');

            axios
                .put(`${baseUrl}/edit_invoice_test_template/${id}/`, body, {
                    headers: {
                        Authorization: `Token ${Token}`,
                    },
                })
                .then((res) => {
                    getTestReport();
                    messageApi.open({
                        type: 'success',
                        content: 'Invoice Report Successfully Updated',
                    });
                })
                .catch((error) => {
                    if (error.response.status === 401) {
                        router.push('/');
                    } else {
                        messageApi.open({
                            type: 'error',
                            content: 'Invoice Report Updated Failed',
                        });
                    }
                });
        }
    };

    const onFinishFailed = (errorInfo: any) => {};

    const handleEditorChange = (data: any) => {
        setEditor(data);
    };

    // Print
    const handlePrint = () => {
        var id: any = invoiceReport.invoice_test.id;
        var url = `/invoice/print?id=${id}`;

        window.open(url, '_blank');
    };

    // Print
    const handlePrint1 = () => {
        var id: any = invoiceReport.invoice_test.id;
        var url = `/invoice/print1?id=${id}`;

        window.open(url, '_blank');
    };

    // Print
    const goBack = () => {
        window.location.href = `/invoice/edit?id=${invoiceReport?.invoice?.id}`;
    };

    const inputChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    console.log('is_authorised_signatory', formData.is_authorised_signatory);
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
                    <Form name="basic" layout="vertical" form={form} onFinish={onFinish} onFinishFailed={onFinishFailed} autoComplete="off">
                        <Form.Item label="Edit Report Template" name="report_template" required={false}>
                            <div dangerouslySetInnerHTML={{ __html: editor }} style={{ display: 'none' }} />
                            {editorLoaded && (
                                <CKEditor
                                    editor={ClassicEditor}
                                    data={editor}
                                    onChange={(event: any, editor: any) => {
                                        const data = editor.getData();
                                        handleEditorChange(data);
                                    }}
                                />
                            )}
                        </Form.Item>
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                Completed
                            </label>
                            <div className="mt-0 flex items-center  font-semibold ">
                                <input id="swift-code-yes" type="radio" name="completed" value="Yes" onChange={inputChange} checked={formData?.completed === 'Yes'} />
                                <label style={{ marginRight: '3px', marginBottom: '0px' }}>Yes</label>

                                <input id="swift-code-no" type="radio" name="completed" value="No" onChange={inputChange} checked={formData?.completed === 'No'} style={{ marginLeft: '20px' }} />
                                <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="yourSelect">Employee Name</label>
                            <select
                                id="yourSelect"
                                value={formData?.is_authorised_signatory ? 'authorized signature' : selectedId}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSelectedId(value);

                                    if (value === 'authorized signature') {
                                        // Set the is_authorised_signatory to true when "authorized signature" is selected
                                        setFormData((prevData: any) => ({
                                            ...prevData,
                                            is_authorised_signatory: true,
                                        }));
                                    } else {
                                        // Reset the is_authorised_signatory flag when an employee is selected
                                        setFormData((prevData: any) => ({
                                            ...prevData,
                                            is_authorised_signatory: false,
                                        }));
                                    }
                                }}
                                className="form-select flex-1"
                            >
                                {invoiceReport?.signatures?.map((element: any) => (
                                    <option key={element.id} value={element.id}>
                                        {element.employee_name}
                                    </option>
                                ))}
                                <option value="authorized signature">Authorized Signature</option>
                            </select>
                        </div>

                        <Form.Item>
                            <div className="form-btn-main">
                                <Space>
                                    {invoiceReport?.invoice_test?.completed == 'Yes' && (invoiceReport.invoice_test?.signature != '' || formData?.is_authorised_signatory == true) ? (
                                        <>
                                            <Button type="primary" onClick={() => handlePrint()}>
                                                Print
                                            </Button>
                                            <Button type="primary" onClick={() => handlePrint1()}>
                                                Print Without Header
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button type="primary" onClick={() => handlePrint()} disabled>
                                                Print
                                            </Button>
                                            <Button type="primary" onClick={() => handlePrint1()} disabled>
                                                Print Without Header
                                            </Button>
                                        </>
                                    )}

                                    <Button type="primary" htmlType="submit">
                                        Update
                                    </Button>
                                </Space>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </>
    );
};

export default InvoiceReport;
