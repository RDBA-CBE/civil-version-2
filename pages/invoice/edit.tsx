import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import IconSave from '@/components/Icon/IconSave';
import IconEye from '@/components/Icon/IconEye';
import { Button, Modal, Form, Input, Select, Space, Drawer, message, Popconfirm } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/router';
import { DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { baseUrl } from '@/utils/function.util';

const Edit = () => {
    const router = useRouter();
    const { id } = router.query;

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Invoice Edit'));
    });

    const [editRecord, setEditRecord] = useState<any>(null);
    const [paymentEditRecord, setPaymentEditRecord] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [open2, setOpen2] = useState(false);
    const [form] = Form.useForm();
    const [form1] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [testFormData, setTestFormData] = useState<any>([]);
    const [tableVisible, setTableVisible] = useState(false);
    const [filterMaterial, setFilterMaterial] = useState([]);
    const [filterTest, setFilterTest] = useState<any>([]);
    const [invoiceFormData, setInvoiceFormData] = useState<any>({});
    const [customerAddress, setCustomerAddress] = useState('');
    const [balance, setBalance] = useState<any>('');
    const [afterTax, setAfterTax] = useState<any>('');
    const [beforeTotalTax, setBeforeTotalTax] = useState<any>(0);
    const [advance, setAdvance] = useState(0);
    const [checkedItems, setCheckedItems] = useState<any>({});
    const [selectedIDs, setSelectedIDs] = useState([]);
    const [totalTaxPercentage, setTotalTaxPercentage] = useState(0);
    const [updateBeforeTax, setUpdateBeforeTax] = useState(0);
    const [updatedSum, setUpdatedSum] = useState(0);
    const [messageApi, contextHolder] = message.useMessage();
    const [paymentMode, setPaymentMode] = useState<any>('');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [admin, setAdmin] = useState<any>();
    const [geteditData, setGetEditData] = useState<any>();
    const [paymentFormData, setPaymentFormData] = useState<any>({
        payment_mode: '',
        date: '',
        upi: '',
        neft: '',
        tds: '',
        cheque_number: '',
        amount: '',
    });
    const [pendingBalance, setPendingBalance] = useState(0);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formUpdated, setFormUpdated] = useState(false);

    const [formData, setFormData] = useState<any>({
        customer: '',
        cheque_number: '',
        project_name: '',
        upi: '',
        discount: '',
        advance: '',
        date: '',
        payment_mode: '',
        bank: '',
        amount_paid_date: '',
        before_tax: '',
        tax: [],
        completed: '',
    });

    useEffect(() => {
        const Admin = localStorage.getItem('admin');
        setAdmin(Admin);
    }, [id]);

    // Get Single Product
    useEffect(() => {
        getInvoiceTestData();
    }, [id]);

    const tableTogle = () => {
        setTableVisible(!tableVisible);
    };

    const selectChange = (event: any) => {
        const { name, value } = event.target;

        // Reset the inactive field's state when changing the payment mode
        setPaymentFormData({
            ...paymentFormData,
            [name]: value,
            cheque_number: name === 'payment_mode' && value !== 'cheque' ? null : paymentFormData.cheque_number,
            upi: name === 'payment_mode' && value !== 'upi' ? null : paymentFormData.upi,
            neft: name === 'payment_mode' && value !== 'neft' ? null : paymentFormData.neft,
            tds: name === 'payment_mode' && value !== 'tds' ? null : paymentFormData.tds,
            // cash: name === 'payment_mode' && value !== 'cash' ? null : null
        });
        setPaymentMode(event.target.value);
    };

    const formatTotal = () => {
        const selectedPercentages = invoiceFormData?.taxs?.filter((item: any) => checkedItems[item.id]);

        if (selectedPercentages?.length > 0) {
            const percentagesArray = selectedPercentages.map((item: any) => `${parseFloat(item.tax_percentage)}%`);
            const selectedName = selectedPercentages.map((item: any) => item.tax_name);
            const nameString = selectedName.join(' + ');

            const percentagesString = percentagesArray.join(' + ');
            return `${nameString} : ${percentagesString} = ${totalTaxPercentage}`;
        }
        return '';
    };

    const getInvoiceTestData = () => {
        axios
            .get(`${baseUrl}/edit_invoice/${id}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                let response = res.data;

                let mergeArray: any = [response.customer, ...response.customers];
                const uniqueArray = mergeArray.reduce((acc: any, obj: any) => {
                    const existingObj = acc.find((item: any) => item.id === obj.id);

                    if (!existingObj) {
                        acc.push(obj);
                    }

                    return acc;
                }, []);

                setSelectedIDs(response?.invoice.tax);

                const data: any = {
                    customers: uniqueArray,
                    invoice: response.invoice,
                    invoice_tests: response.invoice_tests,
                    payment_mode_choices: response.payment_mode_choices,
                    sales_mode: response.sales_mode,
                    taxs: response.taxs,
                    payments: response.payments,
                };

                setGetEditData(data);
                // if (update) {
                const convertedObj: any = {};

                data?.taxs.forEach((item: any) => {
                    convertedObj[item.id] = data?.invoice?.tax.includes(item.id);
                });

                setCheckedItems(convertedObj);

                //Before tax
                const beforetax: any = response?.invoice_tests.reduce((total: any, test: any) => total + parseFloat(test.total), 0);
                const discountedAmount = (beforetax * response.invoice.discount) / 100;
                const discountedBeforeTax = response.invoice.discount !== 0 ? beforetax - discountedAmount : beforetax;
                setUpdateBeforeTax(discountedBeforeTax);
                setBeforeTotalTax(beforetax);
                // -------------------------------------------------------------------------------------------
                // Tax total prrcentage
                const matchedTaxs = data?.taxs.filter((item: any) => data?.invoice?.tax.includes(item.id));
                const sumPercentage = matchedTaxs.reduce((sum: any, item: any) => {
                    return sum + parseFloat(item.tax_percentage);
                }, 0);

                const sumAsNumber = Number(sumPercentage);
                const totalPer: any = (sumAsNumber * discountedBeforeTax) / 100;
                setTotalTaxPercentage(parseInt(totalPer, 10));

                // -------------------------------------------------------------------------------------------
                //After tax
                const After_tax = discountedBeforeTax + totalPer;
                setAfterTax(parseInt(After_tax, 10));
                // -------------------------------------------------------------------------------------------

                setFormData((prevState: any) => ({
                    ...prevState,
                    customer: uniqueArray[0].id,
                    project_name: response.invoice.project_name,
                    discount: response.invoice.discount,
                    advance: response.invoice.advance,
                    date: response.invoice.date,
                    payment_mode: response.invoice.payment_mode,
                    cheque_number: response.invoice.cheque_number,
                    bank: response.invoice.bank,
                    place_of_testing: response.invoice.place_of_testing,
                    amount_paid_date: response.invoice.amount_paid_date,
                    before_tax: parseInt(discountedBeforeTax, 10) || 0,
                    invoice_tests: response?.invoice_tests,
                    upi: response.invoice.upi,
                    tds: response.invoice.tds,
                    completed: response.invoice.completed,
                }));

                setInvoiceFormData(data);
                setCustomerAddress(uniqueArray[0]?.address1);

                const totalAmount = response.payments.reduce((accumulator: any, current: any) => {
                    const amountValue = parseFloat(current.amount);

                    return accumulator + amountValue;
                }, 0);

                setAdvance(totalAmount);

                const InitialBalance: any = After_tax - totalAmount;
                setBalance(parseInt(InitialBalance, 10));
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                } else {
                }
            });
    };

    const getInvoiceTestData2 = (isUpdate: String) => {
        console.log('✌️isUpdate --->', isUpdate);
        axios
            .get(`${baseUrl}/edit_invoice/${id}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                let response = res.data;
                let mergeArray: any = [response.customer, ...response.customers];
                const uniqueArray = mergeArray.reduce((acc: any, obj: any) => {
                    const existingObj = acc.find((item: any) => item.id === obj.id);

                    if (!existingObj) {
                        acc.push(obj);
                    }

                    return acc;
                }, []);

                setSelectedIDs(response?.invoice.tax);

                const data: any = {
                    customers: uniqueArray,
                    invoice: response.invoice,
                    invoice_tests: response.invoice_tests,
                    payment_mode_choices: response.payment_mode_choices,
                    sales_mode: response.sales_mode,
                    taxs: response.taxs,
                    payments: response.payments,
                };
                console.log('✌️data --->', data);

                setGetEditData(data);
                // if (update) {
                const convertedObj: any = {};

                data?.taxs.forEach((item: any) => {
                    convertedObj[item.id] = data?.invoice?.tax.includes(item.id);
                });

                setCheckedItems(convertedObj);

                //Before tax
                const beforetax: any = response?.invoice_tests.reduce((total: any, test: any) => total + parseFloat(test.total), 0);
                console.log('✌️beforetax --->', beforetax);
                const discountedAmount = (beforetax * response.invoice.discount) / 100;
                console.log('✌️discountedAmount --->', discountedAmount);
                const discountedBeforeTax = response.invoice.discount !== 0 ? beforetax - discountedAmount : beforetax;
                console.log('✌️discountedBeforeTax --->', discountedBeforeTax);
                setUpdateBeforeTax(discountedBeforeTax);
                setBeforeTotalTax(beforetax);
                // -------------------------------------------------------------------------------------------
                // Tax total prrcentage
                const matchedTaxs = data?.taxs.filter((item: any) => data?.invoice?.tax.includes(item.id));
                const sumPercentage = matchedTaxs.reduce((sum: any, item: any) => {
                    return sum + parseFloat(item.tax_percentage);
                }, 0);

                const sumAsNumber = Number(sumPercentage);
                const totalPer: any = (sumAsNumber * discountedBeforeTax) / 100;
                setTotalTaxPercentage(parseInt(totalPer, 10));
                console.log('✌️parseInt(totalPer, 10) --->', parseInt(totalPer, 10));

                // -------------------------------------------------------------------------------------------
                //After tax
                const After_tax = discountedBeforeTax + totalPer;
                setAfterTax(parseInt(After_tax, 10));
                console.log('✌️parseInt(After_tax, 10) --->', parseInt(After_tax, 10));
                // -------------------------------------------------------------------------------------------

                setInvoiceFormData(data);
                console.log('invoice format --->', data);
                setCustomerAddress(uniqueArray[0]?.address1);

                const totalAmount = response.payments.reduce((accumulator: any, current: any) => {
                    const amountValue = parseFloat(current.amount);

                    return accumulator + amountValue;
                }, 0);

                setAdvance(totalAmount);
                console.log('✌️totalAmount --->', totalAmount);

                const InitialBalance: any = After_tax - totalAmount;
                setBalance(parseInt(InitialBalance, 10));
                console.log('✌️parseInt(InitialBalance, 10) --->', parseInt(InitialBalance, 10));
                if (isUpdate == 'update') {
                    const body = {
                        customer: formData.customer,
                        project_name: formData.project_name,
                        discount: formData.discount,
                        tax: selectedIDs,
                        total_amount: parseInt(After_tax, 10),
                        advance: totalAmount,
                        balance: parseInt(InitialBalance, 10),
                        amount_paid_date: formData.amount_paid_date,
                        bank: formData.bank,
                        cheque_number: formData.cheque_number,
                        payment_mode: formData.payment_mode,
                        date: formData.date,
                        place_of_testing: formData.place_of_testing,
                        upi: formData.upi,
                        completed: formData.completed,
                    };
                    console.log('✌️body --->', body);

                    updateInvoice(body);
                }
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
    };

    const handleDiscountChange = (e: any) => {
        const discount = parseFloat(e) || 0;
        const beforeTax = parseFloat(beforeTotalTax || '0');
        const discountedAmount = (beforeTax * discount) / 100;
        const discountedBeforeTax = discount !== 0 ? beforeTax - discountedAmount : beforeTax;
        let checkedItem: any = checkedItems;

        let sum = 0;

        invoiceFormData.taxs.forEach((item: any) => {
            if (checkedItem[item.id]) {
                sum += parseFloat(item.tax_percentage);
            }
        });

        setUpdatedSum(sum);

        const finals: any = (discountedBeforeTax * sum) / 100;

        //total percentage
        setUpdateBeforeTax(discountedBeforeTax);

        const totalPer = (updatedSum * discountedBeforeTax) / 100;
        // setTotalTaxPercentage(parseInt(totalPer, 10))
        setTotalTaxPercentage(parseInt(finals, 10));

        // -------------------------------------------------------------------------------------------------------
        //After tax
        const After_tax: any = discountedBeforeTax + totalPer;
        setAfterTax(parseInt(After_tax, 10));
        // -------------------------------------------------------------------------------------------------------

        //Balance
        const InitialBalance: any = parseInt(After_tax, 10) - advance;
        setBalance(InitialBalance);
        // -------------------------------------------------------------------------------------------------------

        if (discount === 0) {
            setFormData((prevState: any) => ({
                ...prevState,
                discount: discount,
                before_tax: parseInt(beforeTotalTax, 10) || '0', // Set your desired initial value,
            }));
        } else {
            setFormData((prevState: any) => ({
                ...prevState,
                discount: discount,
                before_tax: parseInt(discountedBeforeTax.toString(), 10),
            }));
        }
    };

    const handleChange = (id: any, percentage: any) => {
        const beforeTax = updateBeforeTax;

        let checkedItem = { ...checkedItems, [id]: !checkedItems[id] };

        let sum = 0;

        invoiceFormData.taxs.forEach((item: any) => {
            if (checkedItem[item.id]) {
                sum += parseFloat(item.tax_percentage);
            }
        });

        setUpdatedSum(sum);

        const finals: any = (beforeTax * sum) / 100;

        setCheckedItems(checkedItem);
        setSelectedIDs((prevSelectedIDs: any) => {
            if (prevSelectedIDs.includes(id)) {
                return prevSelectedIDs.filter((selectedID: any) => selectedID !== id);
            } else {
                return [...prevSelectedIDs, id];
            }
        });

        setTotalTaxPercentage(parseInt(finals, 10));

        const totalPer = (sum * beforeTax) / 100;

        //After tax
        const After_tax: any = updateBeforeTax + totalPer;
        setAfterTax(parseInt(After_tax, 10));
        // -------------------------------------------------------------------------------------------------------

        //Balance
        const InitialBalance: any = parseInt(After_tax, 10) - advance;
        setBalance(InitialBalance);
        // -------------------------------------------------------------------------------------------------------
    };

    useEffect(() => {
        formatTotal();
    }, [updateBeforeTax, totalTaxPercentage]);

    // get meterial test
    useEffect(() => {
        const Token = localStorage.getItem('token');
        axios
            .get(`${baseUrl}/get_material_test/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setTestFormData(res.data);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
    }, []);

    // modal
    const showModal = () => {
        if (formData.completed == 'Yes') {
            messageApi.open({
                type: 'error',
                content: 'Kindly Change completed status to "NO" and update the invoice, then add the test to invoice.',
            });
        } else {
            setIsModalOpen(true);
            setTableVisible(false);
            setFilterTest([]);
        }
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form1.resetFields();
    };

    const quantityChange = (e: any, index: number) => {
        const updatedFilterTest: any = [...filterTest];
        const filterItem: any = updatedFilterTest[index];

        if (filterItem) {
            const updatedItem = {
                ...filterItem,
                quantity: Number(e),
                total: Number(e) * Number(filterItem.price),
            };
            updatedFilterTest[index] = updatedItem;
            setFilterTest(updatedFilterTest);
        }
    };

    const priceChange = (e: any, index: number) => {
        const updatedFilterTest: any = [...filterTest]; // Create a copy of the array
        const filterItem: any = updatedFilterTest[index];

        if (filterItem) {
            const updatedItem = {
                ...filterItem,
                price: Number(e),
                total: Number(e) * Number(filterItem.quantity),
            };
            updatedFilterTest[index] = updatedItem;
            setFilterTest(updatedFilterTest);
        }
    };

    const inputChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });

        setTestFormData;
    };

    const confirm = (e: any) => {
        console.log(e);
        message.success('Click on Yes');
    };
    const cancel = (e: any) => {
        console.log(e);
        message.error('Click on No');
    };

    const inputUpdate = (e: any) => {
        if (e.target.value == 'Yes') {
            const date = formData.date;

            if (date == null) {
                messageApi.open({
                    type: 'error',
                    content: ' Enter Invoice Date Field',
                });

                setFormData({
                    ...formData,
                    [e.target.name]: 'No',
                });
                return false;
            }
            const BalanceCheck = parseInt(balance, 10);
            if (BalanceCheck > 0) {
                messageApi.open({
                    type: 'error',
                    content: 'Not Fully Paid',
                });

                setFormData({
                    ...formData,
                    [e.target.name]: 'No',
                });
                return false;
            }

            if (invoiceFormData?.invoice_tests?.some((obj: any) => Object.values(obj).includes('No'))) {
                messageApi.open({
                    type: 'error',
                    content: 'Test Not Completed',
                });

                setFormData({
                    ...formData,
                    [e.target.name]: 'No',
                });

                return false;
            }

            setFormData({
                ...formData,
                [e.target.name]: 'Yes',
            });
            return true;
        } else {
            setFormData({
                ...formData,
                [e.target.name]: 'No',
            });

            return true;
        }
    };

    const updateInvoice = (body: any) => {
        const Token = localStorage.getItem('token');

        axios
            .put(`${baseUrl}/edit_invoice/${id}/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                getInvoiceTestData();
                // messageApi.open({
                //     type: 'success',
                //     content: 'Invoice Successfully Updated',
                // });
            })
            .catch((error) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                } else {
                    messageApi.open({
                        type: 'error',
                        content: 'Invoice Updated Failed',
                    });
                }
            });
    };

    const invoiceFormSubmit = (e: any) => {
        const Token = localStorage.getItem('token');

        const body = {
            customer: formData.customer,
            // "sales_mode": Number(formData.sales_mode),
            project_name: formData.project_name,
            discount: formData.discount,
            tax: selectedIDs,
            total_amount: parseInt(afterTax, 10),
            advance: advance,
            balance: parseInt(balance, 10),
            amount_paid_date: formData.amount_paid_date,
            bank: formData.bank,
            cheque_number: formData.cheque_number,
            payment_mode: formData.payment_mode,
            date: formData.date,
            place_of_testing: formData.place_of_testing,
            upi: formData.upi,
            completed: formData.completed,
        };

        axios
            .put(`${baseUrl}/edit_invoice/${id}/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                getInvoiceTestData();
                messageApi.open({
                    type: 'success',
                    content: 'Invoice Successfully Updated',
                });
            })
            .catch((error) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                } else {
                    messageApi.open({
                        type: 'error',
                        content: 'Invoice Updated Failed',
                    });
                }
            });
    };

    // checking
    const invoiceFormSubmit1 = () => {
        const Token = localStorage.getItem('token');

        const body = {
            customer: formData.customer,
            // "sales_mode": Number(formData.sales_mode),
            project_name: formData.project_name,
            discount: formData.discount,
            tax: selectedIDs,
            total_amount: parseInt(afterTax, 10),
            advance: advance,
            balance: parseInt(balance, 10),
            amount_paid_date: formData.amount_paid_date,
            bank: formData.bank,
            cheque_number: formData.cheque_number,
            payment_mode: formData.payment_mode,
            date: formData.date,
            place_of_testing: formData.place_of_testing,
            upi: formData.upi,
            completed: formData.completed,
        };

        axios
            .put(`${baseUrl}/edit_invoice/${id}/`, body, {
                headers: {
                    Authorization: `Token ${Token}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                getInvoiceTestData();
                // messageApi.open({
                //     type: 'success',
                //     content: 'Invoice Successfully Updated',
                // });
            })
            .catch((error) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                } else {
                    // messageApi.open({
                    //     type: 'error',
                    //     content: 'Invoice Updated Failed',
                    // });
                }
            });
    };

    const handleSelectChange = (e: any) => {
        // Find the selected customer in the data array
        const selectedCustomer = invoiceFormData?.customers?.find((customer: any) => customer.id == Number(e.target.value));

        setCustomerAddress(selectedCustomer?.address1 || '');
        setFormData((prevState: any) => ({
            ...prevState,
            customer: selectedCustomer.id,
        }));

        form.setFieldsValue({
            'reciever-address': selectedCustomer?.address1 || '',
        });
    };

    // drawer
    const showDrawer = (item: any) => {
        setEditRecord(item);
        form.setFieldsValue(item);
        setOpen(true);
    };

    const onClose = () => {
        setOpen(false);
        form.resetFields();
        setCustomerAddress('');
    };

    // Multiple Select
    const TestChange = (testIds: string[]) => {
        const filteredTests = filterMaterial.filter((value: any) => {
            return testIds.includes(value.value);
        });
        const addedPrice: any = filteredTests.map((obj: any) => ({ ...obj, quantity: 1, total: Number(obj?.price) }));

        setFilterTest(addedPrice);
    };

    const materialChange = (materialId: any) => {
        const filteredMaterial =
            testFormData?.tests
                ?.filter((test: any) => test.test_material_id === String(materialId))
                .map((test: any) => ({
                    label: test.test_name,
                    value: test.id,
                    price: test.price_per_piece,
                })) ?? [];
        setFilterMaterial(filteredMaterial);
    };

    const onFinish = (values: any) => {
        values.invoice = Number(id);
        const body: any = {
            ...values,
            tests: filterTest.map((item: any) => ({
                ...values,
                test: item?.value,
                quantity: item.quantity,
                price_per_sample: Number(item.price),
                total: Number(item.total.toFixed(2)),
            })),
        };
        invoiceFormSubmit1();
        axios
            .post(`${baseUrl}/create_invoice_test/`, body?.tests, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setIsModalOpen(false);

                getInvoiceTestData2('update');
                form1.resetFields();
            })
            .catch((error) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                } else {
                }
            });
    };

    const onFinishFailed = (errorInfo: any) => {};

    // Invoice Test Delete
    const handleDelete = (id: any) => {
        const Token = localStorage.getItem('token');

        Modal.confirm({
            title: 'Are you sure to delete the TEST record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                invoiceFormSubmit1();
                axios
                    .delete(`${baseUrl}/delete_invoice_test/${id}`, {
                        headers: {
                            Authorization: `Token ${Token}`,
                        },
                    })
                    .then((res) => {
                        getInvoiceTestData2("update");
                    })
                    .catch((error) => {
                        if (error?.response?.status === 401) {
                            router.push('/');
                        }
                    });
            },
        });
    };

    // invoice test edit form onfinish
    const onFinish2 = (values: any) => {
        const Token = localStorage.getItem('token');
        invoiceFormSubmit1();
        axios
            .put(`${baseUrl}/edit_invoice_test/${editRecord.id}/`, values, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                getInvoiceTestData2("update");
                setOpen(false);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
        onClose();
    };

    const onFinishFailed2 = (errorInfo: any) => {};

    const handleQuantityChange = (value: any) => {
        const pricePerSample = form.getFieldValue('price_per_sample') || 0;
        form.setFieldsValue({
            total: value * pricePerSample,
        });
    };

    const handlePricePerSampleChange = (value: any) => {
        const quantity = form.getFieldValue('quantity') || 0;
        form.setFieldsValue({
            total: value * quantity,
        });
    };

    // start Payment

    // modal
    const PaymentModal = () => {
        const BalanceCheck = parseInt(balance, 10);
        if (BalanceCheck <= 0) {
            messageApi.open({
                type: 'error',
                content: 'Already Paid Fully.',
            });
        } else {
            setPaymentModalOpen(true);
            setPaymentMode(null);
            setPaymentFormData({
                payment_mode: 'cash',
                date: '',
                upi: null,
                cheque_number: null,
                tds: null,
                amount: '',
            });
        }
    };

    const paymentOk = () => {
        setPaymentModalOpen(false);
    };

    const paymentCancel = () => {
        setPaymentModalOpen(false);
        form.resetFields();
        setFormSubmitted(false);
    };

    // drawer
    const showPaymentDrawer = (item: any) => {
        setPaymentEditRecord(item);
        setPaymentMode(item?.payment_mode);
        setPaymentFormData({
            payment_mode: item?.payment_mode,
            date: item?.date,
            upi: item?.upi,
            neft: item?.neft,
            tds: item?.tds,
            cheque_number: item?.cheque_number,
            amount: item?.amount,
        });
        setOpen2(true);
    };

    const paymentClose = () => {
        setOpen2(false);
        setFormUpdated(false);
        setPaymentFormData({
            payment_mode: '',
            date: '',
            upi: '',
            neft: '',
            tds: '',
            cheque_number: '',
            amount: '',
        });
    };

    // payment post method
    const paymentSubmit = (e: any) => {
        e.preventDefault();

        const balanceValue = parseInt(balance, 10);

        if (balanceValue < paymentFormData.amount) {
            messageApi.open({
                type: 'error',
                content: 'The amount filed exceeds the available balance.',
            });
            return;
        } else if (paymentFormData.payment_mode == 'upi' && paymentFormData?.upi == null) {
            messageApi.open({
                type: 'error',
                content: 'UPI field is required',
            });
            return;
        } else if (paymentFormData.payment_mode === 'cheque' && paymentFormData?.cheque_number == null) {
            messageApi.open({
                type: 'error',
                content: 'Cheque Number field is required',
            });
            return;
        } else if (paymentFormData.payment_mode === 'neft' && paymentFormData?.neft == null) {
            messageApi.open({
                type: 'error',
                content: 'Neft field is required',
            });
            return;
        } else if (paymentFormData.payment_mode === 'tds' && paymentFormData?.tds == null) {
            messageApi.open({
                type: 'error',
                content: 'TDS field is required',
            });
            return;
        } else {
            invoiceFormSubmit(e);
            setFormSubmitted(true);
            axios
                .post(`${baseUrl}/add_payment/${id}/`, paymentFormData, {
                    headers: {
                        Authorization: `Token ${localStorage.getItem('token')}`,
                    },
                })
                .then((res: any) => {
                    setPaymentModalOpen(false);
                    getInvoiceTestData2("update");
                    messageApi.open({
                        type: 'success',
                        content: 'Payment Successfully Updated',
                    });
                    setPaymentFormData({
                        payment_mode: '',
                        date: '',
                        upi: '',
                        neft: '',
                        tds: '',
                        cheque_number: '',
                        amount: '',
                    });
                    const totalAmount = res.payments.reduce((accumulator: any, current: any) => {
                        const amountValue = parseFloat(current.amount);

                        return accumulator + amountValue;
                    }, 0);
                    setAdvance(totalAmount);

                    const InitialBalance: any = afterTax - totalAmount;
                    setBalance(parseInt(InitialBalance, 10));
                })
                .catch((error: any) => {
                    if (error?.response?.status === 401) {
                        router.push('/');
                    } else {
                    }
                });
        }
    };

    // payment edit
    // const paymentUpdate = (e: any) => {
    //     e.preventDefault();
    //     const Token = localStorage.getItem('token');

    //     if (pendingBalance < paymentFormData.amount) {
    //         messageApi.open({
    //             type: 'error',
    //             content: 'The amount filed exceeds the available balance.',
    //         });
    //         return;
    //     } else if (paymentFormData.payment_mode === 'upi' && paymentFormData?.upi == null) {
    //         if (paymentFormData.payment_mode == 'upi' && paymentFormData?.upi == null) {
    //             messageApi.open({
    //                 type: 'error',
    //                 content: 'UPI field is required',
    //             });
    //             return;
    //         } else if (paymentFormData.payment_mode === 'cheque' && paymentFormData?.cheque_number == null) {
    //             messageApi.open({
    //                 type: 'error',
    //                 content: 'Cheque Number field is required',
    //             });
    //             return;
    //         } else if (paymentFormData?.amount == null) {
    //             messageApi.open({
    //                 type: 'error',
    //                 content: 'Amount field is required',
    //             });
    //             return;
    //         } else {
    //             invoiceFormSubmit(e);
    //             setFormUpdated(true);

    //             axios
    //                 .put(`${baseUrl}/edit_payment/${paymentEditRecord?.id}/`, paymentFormData, {
    //                     headers: {
    //                         Authorization: `Token ${Token}`,
    //                     },
    //                 })
    //                 .then((res: any) => {
    //                     setOpen2(false);
    //                     const totalAmount = res.data.payments.reduce((accumulator: any, current: any) => {
    //                         const amountValue = parseFloat(current.amount);

    //                         return accumulator + amountValue;
    //                     }, 0);

    //                     setAdvance(totalAmount);

    //                     const InitialBalance: any = afterTax - totalAmount;
    //                     setBalance(parseInt(InitialBalance, 10));
    //                     getInvoiceTestData2();
    //                 })
    //                 .catch((error: any) => {
    //                     if (error?.response?.status === 401) {
    //                         router.push('/');
    //                     } else {
    //                     }
    //                 });
    //         }
    //     }
    // };

    const paymentUpdate = (e: any) => {
        e.preventDefault();
        const Token = localStorage.getItem('token');

        // Check if the payment amount exceeds the available balance
        if (pendingBalance < paymentFormData.amount) {
            messageApi.open({
                type: 'error',
                content: 'The amount filed exceeds the available balance.',
            });
            return;
        }

        // Check for specific payment modes and required fields
        if (
            (paymentFormData.payment_mode === 'upi' && paymentFormData?.upi == null) ||
            (paymentFormData.payment_mode === 'neft' && paymentFormData?.neft == null) ||
            (paymentFormData.payment_mode === 'cheque' && paymentFormData?.cheque_number == null) ||
            (paymentFormData.payment_mode === 'tds' && paymentFormData?.tds == null) ||
            paymentFormData?.amount == null
        ) {
            let errorMessage = '';

            if (paymentFormData.payment_mode === 'upi' && paymentFormData?.upi == null) {
                errorMessage = 'UPI field is required';
            } else if (paymentFormData.payment_mode === 'cheque' && paymentFormData?.cheque_number == null) {
                errorMessage = 'Cheque Number field is required';
            } else if (paymentFormData.payment_mode === 'neft' && paymentFormData?.neft == null) {
                errorMessage = 'Neft field is required';
            } else if (paymentFormData.payment_mode === 'tds' && paymentFormData?.tds == null) {
                errorMessage = 'TDS field is required';
            } else if (paymentFormData?.amount == null) {
                errorMessage = 'Amount field is required';
            }

            messageApi.open({
                type: 'error',
                content: errorMessage,
            });
            return;
        }

        // If all checks pass, proceed with the payment update
        invoiceFormSubmit(e);
        setFormUpdated(true);

        axios
            .put(`${baseUrl}/edit_payment/${paymentEditRecord?.id}/`, paymentFormData, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res: any) => {
                setOpen2(false);

                // Calculate total amount and update state
                const totalAmount = res.data.payments.reduce((accumulator: any, current: any) => {
                    const amountValue = parseFloat(current.amount);
                    return accumulator + amountValue;
                }, 0);

                setAdvance(totalAmount);

                // Update balance and fetch updated invoice data
                const InitialBalance: any = afterTax - totalAmount;
                setBalance(parseInt(InitialBalance, 10));
                getInvoiceTestData2("update");
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                } else {
                    // Handle other errors if needed
                }
            });
    };

    // payment Delete
    const PaymentDelete = (id: any) => {
        const Token = localStorage.getItem('token');

        invoiceFormSubmit1();
        Modal.confirm({
            title: 'Are you sure to delete the TEST record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                axios
                    .delete(`${baseUrl}/delete_payment/${id}`, {
                        headers: {
                            Authorization: `Token ${Token}`,
                        },
                    })
                    .then((res) => {
                        getInvoiceTestData2("");
                    })
                    .catch((error) => {
                        if (error?.response?.status === 401) {
                            router.push('/');
                        } else {
                        }
                    });
            },
        });
    };

    const paymentInputChange = (e: any) => {
        setPaymentFormData({
            ...paymentFormData,
            [e.target.name]: e.target.value,
        });

        const oldBalance: any = parseFloat(paymentEditRecord?.amount) + Number(balance);
        setPendingBalance(oldBalance);
    };

    const handleAmountInput = (e: any) => {
        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ''); // Remove non-numeric characters
    };
    // end Payment

    // Print
    const handlePrint = (item: any) => {
        window.location.href = `/invoice/invoiceReport?id=${item.id}`;
    };

    const handlePrintEmployee = (item: any) => {
        const id = item.id;
        const ref = `/invoice/print/?id=${id}`;
        window.open(ref, '_blank'); // Note: "_blank" specifies a new tab or window
    };

    const handlePreviewClick = (id: any) => {
        var id: any = id;
        var url = `/invoice/preview?id=${id}`;
        window.open(url, '_blank');
    };

    return (
        <>
            {admin == 'false' && geteditData?.invoice?.completed == 'Yes' ? (
                <div className="flex flex-col gap-2.5 xl:flex-row">
                    <div className="panel flex-1 px-0 py-6 rtl:xl:ml-6">
                        <div className="mt-8 px-4">
                            <div className="flex flex-col justify-between lg:flex-row">
                                <div className="mb-6 w-full lg:w-1/2 ltr:lg:mr-6 rtl:lg:ml-6">
                                    <div className="text-lg">Bill To :-</div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="country" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Customer Name
                                        </label>
                                        <select id="country" className="form-select flex-1" name="customer" disabled>
                                            {invoiceFormData?.customers?.map((value: any) => (
                                                <option key={value.id} value={value.id}>
                                                    {value?.customer_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="reciever-address" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Address
                                        </label>
                                        <textarea id="reciever-address" name="reciever-address" className="form-input flex-1" value={customerAddress} placeholder="Enter Address" disabled />
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="reciever-email" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Project Name
                                        </label>
                                        <input id="reciever-email" type="email" className="form-input flex-1" name="project_name" value={formData?.project_name} placeholder="Enter Email" disabled />
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/2">
                                    <div className="text-lg"></div>

                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="number" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Invoice Number
                                        </label>
                                        <input id="number" type="text" className="form-input flex-1" name="invoice_no" defaultValue={invoiceFormData?.invoice?.invoice_no} disabled />
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="startDate" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Invoice Date
                                        </label>
                                        <input id="startDate" type="date" className="form-input flex-1" name="date" value={formData.date} disabled />
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="place_of_testing" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Place of testing
                                        </label>
                                        <input id="place_of_testing" type="text" className="form-input flex-1" name="place_of_testing" value={formData.place_of_testing} disabled />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Test Name</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                            <th>Completed</th>
                                            <th>Report</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceFormData.invoice_tests?.length <= 0 && (
                                            <tr>
                                                <td colSpan={5} className="!text-center font-semibold">
                                                    No Item Available
                                                </td>
                                            </tr>
                                        )}
                                        {invoiceFormData?.invoice_tests?.map((item: any, index: any) => {
                                            return (
                                                <tr className="align-top" key={item.id}>
                                                    <td>{item.test_name}</td>
                                                    <td>{Number(item?.quantity)}</td>
                                                    <td> {Number(item?.price_per_sample)} </td>
                                                    <td>{item.quantity * item.price_per_sample}</td>
                                                    <td>{item?.completed}</td>
                                                    <td>
                                                        <PrinterOutlined rev={undefined} className="edit-icon" onClick={() => handlePrintEmployee(item)} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Payment Mode</th>
                                            <th>Cheque Number</th>
                                            <th>neft</th>
                                            <th>Amount</th>
                                            <th>Amount Paid Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceFormData.payments?.length <= 0 && (
                                            <tr>
                                                <td colSpan={5} className="!text-center font-semibold">
                                                    No Item Available
                                                </td>
                                            </tr>
                                        )}
                                        {invoiceFormData.payments?.map((item: any, index: any) => {
                                            console.log('✌️itempayment --->', item);
                                            return (
                                                <tr className="align-top" key={item.id}>
                                                    <td>{item?.payment_mode}</td>
                                                    <td>{item?.cheque_number}</td>
                                                    <td>{item?.upi} </td>
                                                    <td>{item?.amount}</td>
                                                    <td>{item?.date}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                                <div className="mb-6 sm:mb-0"></div>
                                <div className="sm:w-2/5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Discount (%)
                                        </label>
                                        <input id="bank-name" type="text" className="form-input flex-1" name="discount" value={formData?.discount} placeholder="Enter Discount" disabled />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Before Tax
                                        </label>
                                        <input id="bank-name" type="text" className="form-input flex-1" name="before_tax" value={formData?.before_tax} placeholder="Enter Before Tax" disabled />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="country" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Tax
                                        </label>

                                        {invoiceFormData?.taxs?.map((item: any) => {
                                            return (
                                                <div key={item.id}>
                                                    <label>
                                                        <input type="checkbox" value={item.tax_name} checked={checkedItems[item.id]} style={{ marginRight: '5px' }} />
                                                        {item.tax_name}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center justify-between" style={{ marginTop: '20px' }}>
                                        {formatTotal() && <p> {formatTotal()}</p>}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            After Tax
                                        </label>
                                        <input id="bank-name" type="text" className="form-input flex-1" name="after_tax" value={afterTax} placeholder="Enter After Tax" disabled />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Advance
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="advance" value={advance} disabled />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between font-semibold">
                                        <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Balance
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="balance" value={balance} disabled />
                                    </div>
                                    <div className="mt-4 flex items-center justify-start font-semibold">
                                        <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Completed
                                        </label>
                                        <label style={{ marginRight: '3px', marginBottom: '0px' }}>Yes</label>
                                        <input id="swift-code-yes" type="radio" style={{ marginRight: '20px' }} name="completed" value="Yes" checked={formData.completed === 'Yes'} />
                                        <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                                        <input id="swift-code-no" type="radio" name="completed" value="No" checked={formData.completed === 'No'} />
                                    </div>

                                    <div style={{ marginTop: '50px' }}>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1" style={{ display: 'flex' }}>
                                            {/* {
                                        admin == "false" && editGetData?.invoice?.completed == "Yes" ? (
                                            <button
                                                type="button"
                                                className="btn btn-civil w-full gap-2"
                                            >
                                                <IconSave className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                Show
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                className="btn btn-civil w-full gap-2"
                                                onClick={invoiceFormSubmit}
                                            >
                                                <IconSave className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                Update
                                            </button>
                                        )
                                    } */}

                                            {/* <button type="button" className="btn btn-civil w-full gap-2" onClick={invoiceFormSubmit}>
                                        <IconSave className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                        Update
                                    </button> */}

                                            <button className="btn btn-civil w-full gap-2" onClick={() => handlePreviewClick(id)}>
                                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                Preview
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-2.5 xl:flex-row">
                    {contextHolder}
                    <div className="panel flex-1 px-0 py-6 rtl:xl:ml-6">
                        <div className="mt-8 px-4">
                            <div className="flex flex-col justify-between lg:flex-row">
                                <div className="mb-6 w-full lg:w-1/2 ltr:lg:mr-6 rtl:lg:ml-6">
                                    <div className="text-lg">Bill To :-</div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="country" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Customer Name
                                        </label>
                                        <select id="country" className="form-select flex-1" name="customer" onChange={handleSelectChange}>
                                            {invoiceFormData?.customers?.map((value: any) => (
                                                <option key={value.id} value={value.id}>
                                                    {value?.customer_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="reciever-address" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Address
                                        </label>
                                        <textarea id="reciever-address" name="reciever-address" className="form-input flex-1" value={customerAddress} placeholder="Enter Address" />
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="reciever-email" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Project Name
                                        </label>
                                        <input
                                            id="reciever-email"
                                            type="email"
                                            className="form-input flex-1"
                                            name="project_name"
                                            value={formData?.project_name}
                                            onChange={inputChange}
                                            placeholder="Enter Email"
                                        />
                                    </div>
                                </div>
                                <div className="w-full lg:w-1/2">
                                    <div className="text-lg"></div>

                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="number" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Invoice Number
                                        </label>
                                        <input id="number" type="text" className="form-input flex-1" name="invoice_no" defaultValue={invoiceFormData?.invoice?.invoice_no} disabled />
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="startDate" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Invoice Date
                                        </label>
                                        <input id="startDate" type="date" className="form-input flex-1" name="date" value={formData.date} onChange={inputChange} />
                                    </div>
                                    <div className="mt-4 flex items-center">
                                        <label htmlFor="place_of_testing" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Place of testing
                                        </label>
                                        <input id="place_of_testing" type="text" className="form-input flex-1" name="place_of_testing" value={formData.place_of_testing} onChange={inputChange} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Test Name</th>
                                            <th>Quantity</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                            <th>Action</th>
                                            <th>Completed</th>
                                            <th>Report</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceFormData.invoice_tests?.length <= 0 && (
                                            <tr>
                                                <td colSpan={5} className="!text-center font-semibold">
                                                    No Item Available
                                                </td>
                                            </tr>
                                        )}
                                        {invoiceFormData?.invoice_tests?.map((item: any, index: any) => {
                                            return (
                                                <tr className="align-top" key={item.id}>
                                                    <td>{item.test_name}</td>
                                                    <td>{Number(item?.quantity)}</td>
                                                    <td> {Number(item?.price_per_sample)} </td>
                                                    <td>{item.quantity * item.price_per_sample}</td>
                                                    <td>
                                                        <Space>
                                                            <EditOutlined rev={undefined} className="edit-icon" onClick={() => showDrawer(item)} />
                                                            <DeleteOutlined
                                                                rev={undefined}
                                                                style={{ color: 'red', cursor: 'pointer' }}
                                                                className="delete-icon"
                                                                onClick={() => handleDelete(item?.id)}
                                                            />
                                                        </Space>
                                                    </td>
                                                    <td>{item?.completed}</td>
                                                    <td>
                                                        <PrinterOutlined rev={undefined} className="edit-icon" onClick={() => handlePrint(item)} />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                                <div className="mb-6 sm:mb-0">
                                    <button type="button" className="btn btn-civil" onClick={showModal}>
                                        Add Test
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Payment Mode</th>
                                            <th>Cheque Number</th>
                                            <th>UPI</th>
                                            <th>Neft</th>
                                            <th>TDS</th>
                                            <th>Amount</th>
                                            <th>Amount Paid Date</th>
                                            <th>Action</th>

                                            {/* <th >Report</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoiceFormData.payments?.length <= 0 && (
                                            <tr>
                                                <td colSpan={5} className="!text-center font-semibold">
                                                    No Item Available
                                                </td>
                                            </tr>
                                        )}
                                        {invoiceFormData.payments?.map((item: any, index: any) => {
                                            return (
                                                <tr className="align-top" key={item.id}>
                                                    <td>{item?.payment_mode}</td>
                                                    <td>{item?.cheque_number}</td>
                                                    <td>{item?.upi} </td>
                                                    <td>{item?.neft} </td>
                                                    <td>{item?.tds} </td>
                                                    <td>{item?.amount}</td>
                                                    <td>{item?.date}</td>
                                                    <td>
                                                        <Space>
                                                            <EditOutlined rev={undefined} className="edit-icon" onClick={() => showPaymentDrawer(item)} />
                                                            {localStorage.getItem('admin') === 'true' ? (
                                                                <DeleteOutlined
                                                                    rev={undefined}
                                                                    style={{ color: 'red', cursor: 'pointer' }}
                                                                    className="delete-icon"
                                                                    onClick={() => PaymentDelete(item?.id)}
                                                                />
                                                            ) : (
                                                                <DeleteOutlined rev={undefined} style={{ display: 'none' }} className="delete-icon" onClick={() => PaymentDelete(item?.id)} />
                                                            )}
                                                        </Space>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                                <div className="mb-6 sm:mb-0">
                                    <button type="button" className="btn btn-civil" onClick={PaymentModal}>
                                        Add Payment
                                    </button>
                                </div>
                                <div className="sm:w-2/5">
                                    <div className="flex items-center justify-between">
                                        <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Discount (%)
                                        </label>
                                        <input
                                            id="bank-name"
                                            type="number"
                                            className="form-input flex-1"
                                            name="discount"
                                            value={formData?.discount}
                                            onChange={(e) => handleDiscountChange(e.target.value)}
                                            placeholder="Enter Discount"
                                        />
                                        {/* <div>Subtotal</div>
                                                                <div>265.00</div> */}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Before Tax
                                        </label>
                                        <input
                                            id="bank-name"
                                            type="text"
                                            className="form-input flex-1"
                                            name="before_tax"
                                            value={formData?.before_tax}
                                            onChange={inputChange}
                                            placeholder="Enter Before Tax"
                                            disabled
                                        />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="country" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Tax
                                        </label>

                                        {invoiceFormData?.taxs?.map((item: any) => {
                                            return (
                                                <div key={item.id}>
                                                    <label>
                                                        <input
                                                            type="checkbox"
                                                            value={item.tax_name}
                                                            checked={checkedItems[item.id]}
                                                            onChange={() => handleChange(item.id, item.tax_percentage)}
                                                            style={{ marginRight: '5px' }}
                                                        />
                                                        {item.tax_name}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center justify-between" style={{ marginTop: '20px' }}>
                                        {formatTotal() && <p> {formatTotal()}</p>}
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            After Tax
                                        </label>
                                        <input
                                            id="bank-name"
                                            type="text"
                                            className="form-input flex-1"
                                            name="after_tax"
                                            value={afterTax}
                                            onChange={inputChange}
                                            placeholder="Enter After Tax"
                                            disabled
                                        />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Advance
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="advance" value={advance} disabled />
                                    </div>
                                    <div className="mt-4 flex items-center justify-between font-semibold">
                                        <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Balance
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="balance" value={balance} onChange={inputChange} disabled />
                                    </div>
                                    <div className="mt-4 flex items-center justify-start font-semibold">
                                        <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Completed
                                        </label>
                                        <label style={{ marginRight: '3px', marginBottom: '0px' }}>Yes</label>
                                        <input
                                            id="swift-code-yes"
                                            type="radio"
                                            style={{ marginRight: '20px' }}
                                            name="completed"
                                            value="Yes"
                                            onChange={inputUpdate}
                                            checked={formData.completed === 'Yes'}
                                        />
                                        <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                                        <input id="swift-code-no" type="radio" name="completed" value="No" onChange={inputUpdate} checked={formData.completed === 'No'} />
                                    </div>

                                    <div style={{ marginTop: '50px' }}>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1" style={{ display: 'flex' }}>
                                            {/* {
                                                                        admin == "false" && formData?.completed == "Yes" ? (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-civil w-full gap-2"
                                                                                onClick={() => invoiceDataShow(id)}
                                                                            >
                                                                                <IconSave className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                                                Show
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-civil w-full gap-2"
                                                                                onClick={invoiceFormSubmit}
                                                                            >
                                                                                <IconSave className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                                                Update
                                                                            </button>
                                                                        )
                                                                    } */}

                                            <button type="button" className="btn btn-civil w-full gap-2" onClick={invoiceFormSubmit}>
                                                <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                Update
                                            </button>

                                            {/* <button className="btn btn-gray w-full gap-2" onClick={() => handlePreviewClick(id)}>
                                                    <IconEye className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                    Preview
                                                </button> */}
                                            {/* {geteditData?.invoice?.completed == 'Yes' ? ( */}
                                            <button className="btn btn-gray w-full gap-2" onClick={() => handlePreviewClick(id)}>
                                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                Preview
                                            </button>
                                            {/* ) : (
                                                <button className="btn btn-gray w-full gap-2" disabled>
                                                    <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                    Preview
                                                </button>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Modal */}
                    <Modal title="Create Test" open={isModalOpen} width={900} onOk={handleOk} onCancel={handleCancel} footer={false}>
                        <Form name="basic" onFinish={onFinish} onFinishFailed={onFinishFailed} layout="vertical" form={form1}>
                            <Form.Item label="Material Name" name="material_id" required={false} rules={[{ required: true, message: 'Please select a Material Name!' }]}>
                                <Select onChange={materialChange} showSearch filterOption={(input: any, option: any) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}>
                                    {testFormData?.materials?.map((value: any) => (
                                        <Select.Option key={value.id} value={value.id}>
                                            {value.material_name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item label="Test" name="test" required={false} rules={[{ required: true, message: 'Please select one or more tests!' }]}>
                                <Select
                                    mode="multiple"
                                    style={{ width: '100%' }}
                                    placeholder="Select one or more tests"
                                    onChange={TestChange}
                                    optionLabelProp="label"
                                    options={filterMaterial}
                                    showSearch
                                    filterOption={(input: any, option: any) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button className="getInfoBtn" onClick={tableTogle}>
                                    {tableVisible ? 'Hide Info' : 'Get Info'}
                                </Button>
                            </Form.Item>

                            {tableVisible && (
                                <div className="table-responsive">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Test Name</th>
                                                <th className="w-1">Quantity</th>
                                                <th className="w-1">Price Per Sample</th>
                                                <th>Total</th>
                                                <th className="w-1"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filterTest.length <= 0 && (
                                                <tr>
                                                    <td colSpan={5} className="!text-center font-semibold">
                                                        No Item Available
                                                    </td>
                                                </tr>
                                            )}
                                            {filterTest.map((item: any, index: any) => {
                                                return (
                                                    <tr className="align-top" key={item.value}>
                                                        <td>
                                                            <input type="text" className="form-input min-w-[200px]" placeholder="Enter Item Name" defaultValue={item?.label} />
                                                            {/* <textarea className="form-textarea mt-4" placeholder="Enter Description" defaultValue={item.description}></textarea> */}
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-input w-32"
                                                                placeholder="Quantity"
                                                                value={Number(item?.quantity)}
                                                                min={0}
                                                                onChange={(e) => quantityChange(e.target.value, index)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <input
                                                                type="float"
                                                                className="form-input w-32"
                                                                placeholder="Price"
                                                                min={0}
                                                                onChange={(e) => priceChange(e.target.value, index)}
                                                                value={Number(item?.price)}
                                                            />
                                                        </td>
                                                        <td>{item?.quantity * Number(item.price)}</td>
                                                        {/* <td>
                                                                                        <button type="button" onClick={() => removeItem(item)}>
                                                                                            <IconX className="w-5 h-5" />
                                                                                        </button>
                                                                                    </td> */}
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div style={{ paddingTop: '30px' }}>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit">
                                        Create
                                    </Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </Modal>
                    {/* Invoice Edit Drawer */}
                    <Drawer title="Edit Test" placement="right" width={600} onClose={onClose} open={open}>
                        <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={onFinish2} onFinishFailed={onFinishFailed2} autoComplete="off">
                            <Form.Item label="Test Name" name="test_name" required={false} rules={[{ required: true, message: 'Please input your Test Name!' }]}>
                                <Input disabled />
                            </Form.Item>

                            <Form.Item label="Quantity" name="quantity" required={false} rules={[{ required: true, message: 'Please input your Quantity!' }]}>
                                <Input onChange={(e) => handleQuantityChange(e.target.value)} />
                            </Form.Item>

                            <Form.Item label="Price Per Sample" name="price_per_sample" required={false} rules={[{ required: true, message: 'Please input your Tax Status!' }]}>
                                <Input onChange={(e) => handlePricePerSampleChange(e.target.value)} />
                            </Form.Item>

                            <Form.Item
                                label="Total"
                                name="total"
                                required={false}
                                // rules={[{ required: true, message: 'Please input your !' }]}
                            >
                                <Input disabled />
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

                    {/* payment Modal */}
                    <Modal title="Add Payment" open={paymentModalOpen} width={600} onOk={paymentOk} onCancel={paymentCancel} footer={false}>
                        <form>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Amount Paid Date</label>
                                <input type="date" required className="form-input flex-1" name="date" value={paymentFormData?.date} onChange={paymentInputChange} />
                                {formSubmitted && paymentFormData?.date === '' && <p style={{ color: 'red' }}>Amount Paid Date is required</p>}
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label htmlFor="payment-mode" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Payment Mode
                                </label>
                                <select id="payment-mode" className="form-select flex-1" name="payment_mode" value={paymentFormData?.payment_mode} required onChange={selectChange}>
                                    {invoiceFormData?.payment_mode_choices?.map((value: any) => (
                                        <option key={value.id} value={value.value}>
                                            {value.value}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                {paymentFormData?.payment_mode === 'cheque' && (
                                    <>
                                        <label htmlFor="cheque" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Cheque Number
                                        </label>
                                        <input
                                            id="cheque-number"
                                            type="text"
                                            className="form-input flex-1"
                                            name="cheque_number"
                                            value={paymentFormData?.cheque_number}
                                            onChange={paymentInputChange}
                                            required
                                        />
                                        {formSubmitted && paymentFormData?.cheque_number === null && <p style={{ color: 'red' }}>Cheque Number field is required</p>}
                                    </>
                                )}
                                {paymentFormData?.payment_mode === 'upi' && (
                                    <>
                                        <label htmlFor="upi" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            UPI Ref
                                        </label>
                                        <input id="upi" type="text" className="form-input flex-1" name="upi" value={paymentFormData?.upi} onChange={paymentInputChange} required />
                                        {formSubmitted && paymentFormData?.upi === null && <p style={{ color: 'red' }}>UPI field is required</p>}
                                    </>
                                )}
                                {paymentFormData?.payment_mode === 'neft' && (
                                    <>
                                        <label htmlFor="neft" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Neft
                                        </label>
                                        <input id="upi" type="text" className="form-input flex-1" name="neft" value={paymentFormData?.neft} onChange={paymentInputChange} required />
                                        {formSubmitted && paymentFormData?.upi === null && <p style={{ color: 'red' }}>Neft field is required</p>}
                                    </>
                                )}

                                {paymentFormData?.payment_mode === 'tds' && (
                                    <>
                                        <label htmlFor="tds" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            TDS
                                        </label>
                                        <input id="upi" type="text" className="form-input flex-1" name="tds" value={paymentFormData?.tds} onChange={paymentInputChange} required />
                                        {formSubmitted && paymentFormData?.tds === null && <p style={{ color: 'red' }}>TDS field is required</p>}
                                    </>
                                )}
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label>Amount</label>
                                <input
                                    className="form-input flex-1"
                                    name="amount"
                                    value={paymentFormData?.amount}
                                    required
                                    onChange={paymentInputChange}
                                    pattern="[0-9]*"
                                    onInput={handleAmountInput}
                                />
                                {formSubmitted && paymentFormData?.amount === '' && <p style={{ color: 'red' }}>Amount is required</p>}
                            </div>
                            <div style={{ paddingTop: '30px' }}>
                                <Button type="primary" htmlType="submit" onClick={paymentSubmit}>
                                    Add
                                </Button>
                            </div>
                        </form>
                    </Modal>

                    {/* Invoice payment Edit Drawer */}
                    <Drawer title="Edit Payment" placement="right" width={600} onClose={paymentClose} open={open2}>
                        <form>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Amount Paid Date</label>
                                <input type="date" className="form-input flex-1" name="date" value={paymentFormData?.date} onChange={paymentInputChange} />
                                {formUpdated && paymentFormData?.date === '' && <p style={{ color: 'red' }}>Amount Paid Date is required</p>}
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <label htmlFor="payment-mode" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Payment Mode
                                </label>
                                <select id="payment-mode" className="form-select flex-1" name="payment_mode" value={paymentFormData?.payment_mode} onChange={selectChange}>
                                    {invoiceFormData?.payment_mode_choices?.map((value: any) => {
                                        return (
                                            <option key={value.id} value={value.value}>
                                                {value.value}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                {paymentMode === 'cheque' && (
                                    <>
                                        <label htmlFor="cheque" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Cheque Number
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="cheque_number" value={paymentFormData?.cheque_number} onChange={paymentInputChange} />
                                        {formUpdated && paymentFormData?.cheque_number === null && <p style={{ color: 'red' }}>Cheque Number field is required</p>}
                                    </>
                                )}
                                {paymentMode === 'upi' && (
                                    <>
                                        <label htmlFor="upi" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            UPI Number
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="upi" value={paymentFormData?.upi} onChange={paymentInputChange} />
                                        {formUpdated && paymentFormData?.upi === null && <p style={{ color: 'red' }}>UPI field is required</p>}
                                    </>
                                )}
                                {paymentMode === 'neft' && (
                                    <>
                                        <label htmlFor="neft" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Neft
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="neft" value={paymentFormData?.neft} onChange={paymentInputChange} />
                                        {formUpdated && paymentFormData?.neft === null && <p style={{ color: 'red' }}>Neft field is required</p>}
                                    </>
                                )}

                                {paymentMode === 'tds' && (
                                    <>
                                        <label htmlFor="tds" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            TDS
                                        </label>
                                        <input id="swift-code" type="text" className="form-input flex-1" name="tds" value={paymentFormData?.tds} onChange={paymentInputChange} />
                                        {formUpdated && paymentFormData?.tds === null && <p style={{ color: 'red' }}>TDS field is required</p>}
                                    </>
                                )}
                            </div>
                            <div style={{ marginBottom: '10px' }}>
                                <label>Amount</label>
                                <input className="form-input flex-1" name="amount" value={paymentFormData?.amount} onChange={paymentInputChange} />
                                {formUpdated && paymentFormData?.amount === '' && <p style={{ color: 'red' }}>Amount is required</p>}
                            </div>
                            <div style={{ paddingTop: '30px' }}>
                                <Button type="primary" htmlType="submit" onClick={paymentUpdate}>
                                    Update
                                </Button>
                            </div>
                        </form>
                    </Drawer>
                </div>
            )}
        </>
    );
};

export default Edit;
