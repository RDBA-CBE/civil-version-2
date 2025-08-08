import IconEye from '@/components/Icon/IconEye';
import Models from '@/imports/models.import';
import { setPageTitle } from '@/store/themeConfigSlice';
import { commomDateFormat, Dropdown, DropdownArrayString, roundNumber, useSetState } from '@/utils/function.util';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';

import IconSave from '@/components/Icon/IconSave';
import { Button, Modal, Form, Input, Select, Space, Drawer, message, Popconfirm, Spin } from 'antd';
import IconLoader from '@/components/Icon/IconLoader';
import InvoiceData from '@/components/invoice/invoiceData';
import CustomSelect from '@/components/Select';
import moment from 'moment';
import { PAYMENT_MODE_OPTIONS, TAX } from '@/utils/constant';

export default function Edits() {
    const router = useRouter();
    const { id } = router.query;

    const dispatch = useDispatch();

    const [messageApi, contextHolder] = message.useMessage();

    const [form] = Form.useForm();

    const [form1] = Form.useForm();

    const [form2] = Form.useForm();

    const [state, setState] = useSetState({
        isAdmin: false,
        customerList: [],
        checkedItems: {},
        editData: null,
        isOpen: false,
        isModalOpen: false,
        tableVisible: false,
        filterTest: [],
        isOpenPayment: false,
        discountOpen: false,
        btnLoading: false,
        materialNameList: {},
        tableToggleVisible: false,
        customerCurrentPage: 1,
        customerHasNext: null,
        payment_mode: { value: 'cash', label: 'Cash' },
        deletingId: null,
        discount: null,
        loading: false,
        invoiceTax: [],
        taxes: [],
    });

    useEffect(() => {
        dispatch(setPageTitle('Invoice Edit'));
    });

    useEffect(() => {
        if (id) {
            getInvoice();
            testList();
            paymentList();
        }
        customersList(state.customerCurrentPage);
        materialNameList();
        role();
    }, [id]);

    const role = async () => {
        try {
            setState({ loading: true });
            const data = localStorage.getItem('admin');

            let isAdmin = false;
            if (data) {
                try {
                    const parsedData = JSON.parse(data);
                    isAdmin = !!parsedData;
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

    const materialNameList = async () => {
        try {
            const res: any = await Models.invoice.materialNameList();
            setState({ materialNameList: res });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const testList = async (page = 1) => {
        try {
            const res: any = await Models.invoice.testList(id);
            setState({ testList: res });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const paymentList = async (page = 1) => {
        try {
            const res: any = await Models.invoice.paymentList(id);
            setState({ paymentList: res });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const getInvoice = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.invoice.invoiceDetails(id);
            setState({
                details: res,
                customerName: { value: res?.customer?.id, label: res?.customer?.customer_name },
                customerAddress: res?.customer?.address1,
                project_name: res?.project_name,
                date: res?.date,
                place_of_testing: res?.place_of_testing,
                balance: res?.balance,
                advance: res?.advance,
                completed: res?.completed,
                total_amount: res?.total_amount,
                taxs: res?.tax,
                after_tax_amount: res?.after_tax_amount,
                before_tax_amount: res?.before_tax_amount,
                // discountData: !ObjIsEmpty(res?.customer?.customer_discount) ? res?.customer?.customer_discount : null,
                // discount: !ObjIsEmpty(res?.customer?.customer_discount) ? Number(res?.customer?.customer_discount?.discount) : null,
            });

            if (res?.invoice_discounts?.length > 0) {
                setState({
                    discount: roundNumber(res?.invoice_discounts[0]?.discount) || 0,
                    discountData: res?.invoice_discounts[0],
                });
            }
            form2.setFieldsValue({
                invoice_no: res?.invoice_no || '',
                discount: res?.invoice_discounts?.length > 0 ? roundNumber(res?.invoice_discounts[0]?.discount) || 0 : 0,
            });
            if (res?.invoice_taxes?.length > 0) {
                const filter = res?.invoice_taxes?.filter((item:any) => item.enabled == true);
                setState({ checkedItems: filter, taxes: res?.invoice_taxes });
                const totalPercentage = roundNumber(res?.after_tax_amount )- roundNumber(res?.before_tax_amount);
                const taxData = formatTaxDisplay(filter, totalPercentage);
                setState({ taxData });
            } else {
                setState({ checkedItems: [], taxData: null });
            }
            setState({ loading: false });
        } catch (error) {
            setState({ loading: false });

            console.log('✌️error --->', error);
        }
    };

    const createTest = async (values: any) => {
        try {
            setState({ testLoading: true });

            const createPromises = state.filterTest.map(async (item: any) => {
                const body = {
                    quantity: item.quantity || null,
                    total: item.total || null,
                    price_per_sample: Number(item.price) || null,
                    invoice: Number(id),
                    test: item?.value,
                };
                return Models.invoice.createTest(body);
            });

            await Promise.all(createPromises);

            await testList();
            await getInvoice();
            await invoiceUpdate();
            form1.resetFields();
            setState({
                isModalOpen: false,
                testLoading: false,
                tableToggleVisible: false,
            });
        } catch (error) {
            setState({ testLoading: false });
            console.log('✌️error --->', error);
        }
    };

    const updateTest = async (values: any) => {
        try {
            setState({ testLoading: true });
            const body: any = {
                invoice: Number(id),
                test_name: values?.test_name,
                quantity: Number(values?.quantity),
                price_per_sample: Number(values?.price_per_sample),
                total: Number(values?.total),
            };
            await Models.invoice.updateTest(state.editTestId, body);
            await Promise.all([testList(), getInvoice(), invoiceUpdate()]);
            setState({ isOpen: false });
            form.resetFields();
            setState({ testLoading: false });
        } catch (error) {
            setState({ testLoading: false });
            console.error('Update failed:', error);
        }
    };

    const handleSubmit = async (e: any) => {
        try {
            if (!state.date) {
                messageApi.open({
                    type: 'error',
                    content: 'Please select invoice date.',
                });
                return;
            }
            setState({ btnLoading: true });
            const body: any = {
                date: state.date,
                completed: state.completed,
                place_of_testing: state.place_of_testing,
            };

            const advance = roundNumber(state.advance);
            const afterTax = roundNumber(state.after_tax_amount);

            if (advance == afterTax) {
                body.fully_paid = true;
            } else {
                body.fully_paid = false;
            }

            const res = await Models.invoice.editInvoice(id, body);
            messageApi.open({
                type: 'success',
                content: 'Invoice updated successfully',
            });
            getInvoice();
            setState({ btnLoading: false });
        } catch (error) {
            setState({ btnLoading: false });
            console.log('✌️error --->', error);
        }
    };

    const invoiceUpdate = async () => {
        try {
            const body: any = {
            };

            await Models.invoice.editInvoice(id, body);

            const invoice: any = await Models.invoice.invoiceDetails(id);

            const advance = roundNumber(invoice.advance);
            const afterTax = roundNumber(invoice.after_tax_amount);

            if (advance == afterTax) {
                body.fully_paid = true;
            } else {
                body.fully_paid = false;
            }

            await Models.invoice.editInvoice(id, body);
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const handleDelete = async (id: any) => {
        try {
            setState({ testDeleteLoading: true, deletingId: id });
            await Models.invoice.deleteTest(id);
            testList();
            getInvoice();
            invoiceUpdate();
            messageApi.open({
                type: 'success',
                content: 'Test deleted successfully',
            });
            setState({ testDeleteLoading: false, deletingId: null });
        } catch (error) {
            setState({ testDeleteLoading: false });
            console.log('✌️error --->', error);
        }
    };

    const deletePayment = async (id: any) => {
        try {
            await Models.invoice.deletePayment(id);
            paymentList();
            getInvoice();
            invoiceUpdate();
            messageApi.open({
                type: 'success',
                content: 'Payment deleted successfully',
            });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const PaymentDelete = (id: any) => {
        Modal.confirm({
            title: 'Are you sure to delete the Payment record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                deletePayment(id);
            },
        });
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

    const formatTaxDisplay = (selectedTaxes: any[], total: number) => {
        if (selectedTaxes.length === 0) return '';

        const names = selectedTaxes.map((tax) => tax.tax_name).join(' + ');
        const percentages = selectedTaxes.map((tax) => `${Math.round(parseFloat(tax.tax_percentage))}%`).join(' + ');

        return `${names} : ${percentages} = ${Math.round(total)}`;
    };

    const inputChange = (e: any) => {
        setState({
            [e.target.name]: e.target.value,
        });
    };

    const showDrawer = (item: any) => {
        const data = {
            ...item,
            test_name: item?.test_name || '',
            quantity: item.qty,
        };
        form.setFieldsValue(data);
        setState({
            editTestId: item?.id,
            isOpen: true,
        });
    };

    const showModal = () => {
        if (state.details?.invoice?.completed == 'Yes') {
            messageApi.open({
                type: 'error',
                content: 'Kindly Change completed status to "NO" and update the invoice, then add the test to invoice.',
            });
        } else {
            setState({
                isModalOpen: true,
                tableVisible: false,
                filterTest: [],
                testId: null,
            });
        }
    };
    const showPaymentDrawer = (item: any) => {
        setState({
            paymentId: item?.id,
            payment_mode: { value: item?.payment_mode, label: item?.payment_mode },
            paymentAmount: item?.amount,
            isOpenPayment: true,
            payment_number:
                item?.payment_mode == 'upi' ? item?.upi : item?.payment_mode == 'neft' ? item?.neft : item?.payment_mode == 'tds' ? item?.tds : item?.payment_mode == 'cheque' ? item?.cheque : null,
            paymentDate: item?.date ? moment(item?.date).format('YYYY-MM-DD') : '',
        });
    };

    console.log('paymentDate', state.paymentDate);

    const PaymentModal = () => {
        const BalanceCheck = parseInt(state.balance, 10);
        if (BalanceCheck <= 0) {
            messageApi.open({
                type: 'error',
                content: 'Already Paid Fully.',
            });
        } else {
            setState({
                isOpenPayment: true,
            });
        }
    };

    const handleChange = async (clickedTaxName: string) => {
        try {
            const isIGST = clickedTaxName === 'IGST';
            const checked = state.taxes.map((tax:any) => ({
                ...tax,
                enabled: isIGST
                    ? tax.tax_name === 'IGST'
                    : ['CGST', 'SGST'].includes(tax.tax_name),
            }));
    
            setState({ taxes: checked });
    
            await Promise.all(
                checked.map((tax: any) => 
                    Models.invoice.updateInvoiceTax(tax?.id, {
                        enabled: tax.enabled
                    })
                )
            );
    
            await invoiceUpdate();
            await getInvoice()
            
        } catch (error) {
            console.error('Error in handleChange:', error);
            setState({ taxes: state.taxes });
        }
    };


    const inputUpdate = (e: any) => {
        if (e.target.value == 'Yes') {
            const date = state.date;

            if (date == null) {
                messageApi.open({
                    type: 'error',
                    content: ' Enter Invoice Date Field',
                });

                setState({ completed: 'No' });

                return false;
            }
            const BalanceCheck = parseInt(state.balance, 10);
            if (BalanceCheck > 0) {
                messageApi.open({
                    type: 'error',
                    content: 'Not Fully Paid',
                });

                setState({ completed: 'No' });

                return false;
            }

            if (state.testList?.some((obj: any) => Object.values(obj).includes('No'))) {
                messageApi.open({
                    type: 'error',
                    content: 'Test Not Completed',
                });

                setState({ completed: 'No' });

                return false;
            }
            setState({ completed: 'Yes' });

            return true;
        } else {
            setState({ completed: 'No' });

            return true;
        }
    };

    const materialChange = (materialId: any) => {
        const res =
            state.materialNameList?.tests
                ?.filter((test: any) => test.test_material_id === String(materialId))
                .map((test: any) => ({
                    label: test.test_name,
                    value: test.id,
                    price: test.price_per_piece,
                })) ?? [];
        form1.setFieldsValue({ test: [] });

        setState({ testMaterialList: res, filterTest: [] });
    };

    const TestChange = (selectedOptions: any[] | any) => {
        const options = Array.isArray(selectedOptions) ? selectedOptions : selectedOptions ? [selectedOptions] : [];

        const addedPrice = options.map((obj: any) => ({
            ...obj,
            quantity: 1,
            total: Number(obj?.price) || 0,
        }));

        setState({ filterTest: addedPrice });
    };

    const quantityChange = (e: any, index: number) => {
        const updatedFilterTest: any = [...state.filterTest];
        const filterItem: any = updatedFilterTest[index];
        if (filterItem) {
            const updatedItem = {
                ...filterItem,
                quantity: Number(e),
                total: Number(e) * Number(filterItem.price),
            };
            updatedFilterTest[index] = updatedItem;
            setState({ filterTest: updatedFilterTest });
        }
    };

    const priceChange = (e: any, index: number) => {
        const updatedFilterTest: any = [...state.filterTest]; // Create a copy of the array
        const filterItem: any = updatedFilterTest[index];
        if (filterItem) {
            const updatedItem = {
                ...filterItem,
                price: Number(e),
                total: Number(e) * Number(filterItem.quantity),
            };
            updatedFilterTest[index] = updatedItem;
            setState({ filterTest: updatedFilterTest });

            // setFilterTest(updatedFilterTest);
        }
    };

    const updateInvoiceCustomer = async (value: any) => {
        try {
            const body = {
                customer: value?.value,
            };

            let discountValue = 0;
            const customer: any = await Models.discount.getCustomerDiscount(value.value);
            if (customer?.results?.length > 0) {
                discountValue = customer?.results[0].discount;
            } else {
                discountValue = 0;
            }

            const discountBody = {
                discount: discountValue,
                invoice: id,
            };

            if (state.discountData == undefined) {
                const discountBody = {
                    discount: discountValue,
                    invoice: id,
                };

                await Models.invoice.createInvoiceDiscount(discountBody);
            } else {
                await Models.invoice.updateInvoiceDiscount(state.discountData?.id, discountBody);
            }
            await Models.invoice.editInvoice(id, body);
            await getInvoice();
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const addPayment = async (e: any) => {
        try {
            if (!state.paymentDate) {
                messageApi.open({
                    type: 'error',
                    content: 'Please select payment date.',
                });
                return;
            }

            if (state.payment_mode?.value != 'cash' && !state.payment_number) {
                messageApi.open({
                    type: 'error',
                    content: `Please enter ${state.payment_mode?.value} number.`,
                });

                return;
            }

            if (!state.paymentAmount) {
                messageApi.open({
                    type: 'error',
                    content: 'Please enter payment amount.',
                });

                return;
            }

            if (state.paymentAmount <= 0) {
                messageApi.open({
                    type: 'error',
                    content: 'Payment amount should be greater than 0.',
                });
                return;
            }

            const paymentAmount = roundNumber(state.paymentAmount);
            const balance = roundNumber(state.balance);

            if (paymentAmount > balance) {
                messageApi.open({
                    type: 'error',
                    content: 'Payment amount cannot be greater than balance.',
                });
                return;
            }

            setState({ paymentLoading: true });
            const body: any = {
                payment_mode: state.payment_mode?.value,
                date: state.paymentDate,
                amount: state.paymentAmount,
                invoice_no: id,
            };
            if (state.payment_mode?.value == 'cheque') {
                body.cheque_number = state.payment_number;
            }
            if (state.payment_mode?.value == 'upi') {
                body.upi = state.payment_number;
            }

            if (state.payment_mode?.value == 'neft') {
                body.neft = state.payment_number;
            }

            if (state.payment_mode?.value == 'tds') {
                body.tds = state.payment_number;
            }

            const res = await Models.invoice.addPayment(body);
            paymentList();
            getInvoice();
            invoiceUpdate();
            setState({ paymentLoading: false, isOpenPayment: false, paymentId: null, payment_mode: { value: 'cash', label: 'Cash' }, paymentAmount: '', paymentDate: '' });
        } catch (error: any) {
            if (error?.amount?.length > 0) {
                messageApi.open({
                    type: 'error',
                    content: error?.amount[0],
                });
            }
            setState({ paymentLoading: false });
            setState({ paymentLoading: false });
            console.log('✌️error --->', error);
        }
    };

    const updatePayment = async (e: any) => {
        try {
            if (state.payment_mode?.value != 'cash' && !state.payment_number) {
                messageApi.open({
                    type: 'error',
                    content: `Please enter ${state.payment_mode?.value} number.`,
                });

                return;
            }
            if (!state.paymentAmount) {
                messageApi.open({
                    type: 'error',
                    content: 'Please enter payment amount.',
                });

                return;
            }

            if (state.paymentAmount <= 0) {
                messageApi.open({
                    type: 'error',
                    content: 'Payment amount should be greater than 0.',
                });
                return;
            }
            setState({ paymentLoading: true });

            const body: any = {
                payment_mode: state.payment_mode?.value,
                date: state.paymentDate,
                amount: state.paymentAmount,
                invoice_no: id,
            };
            if (state.payment_mode?.value == 'cheque') {
                body.cheque_number = state.payment_number;
            }
            if (state.payment_mode?.value == 'upi') {
                body.upi = state.payment_number;
            }

            if (state.payment_mode?.value == 'neft') {
                body.neft = state.payment_number;
            }

            if (state.payment_mode?.value == 'tds') {
                body.tds = state.payment_number;
            }

            const res = await Models.invoice.updatePayment(state.paymentId, body);
            paymentList();
            getInvoice();
            invoiceUpdate();

            setState({ paymentLoading: false, isOpenPayment: false, paymentId: null, payment_mode: { value: 'cash', label: 'Cash' }, paymentAmount: '', paymentDate: '' });
        } catch (error: any) {
            if (error?.amount?.length > 0) {
                messageApi.open({
                    type: 'error',
                    content: error?.amount[0],
                });
            }
            setState({ paymentLoading: false });
            console.log('✌️error --->', error);
        }
    };

    const updateDiscount = async (values: any) => {
        try {
            setState({ discountLoading: true });

            if (state.discountData == undefined) {
                const discountBody = {
                    discount: values?.discount ? values?.discount : 0,
                    invoice: id,
                };

                await Models.invoice.createInvoiceDiscount(discountBody);
                await getInvoice();
                await invoiceUpdate();
                setState({ isOpenDiscount: false, discountLoading: false });
            } else {
                const body = {
                    discount: values?.discount ? values?.discount : 0,
                };

                await Models.invoice.updateInvoiceDiscount(state.discountData.id, body);
                await getInvoice();
                await invoiceUpdate();
                setState({ isOpenDiscount: false, discountLoading: false });
            }
        } catch (error) {
            setState({ discountLoading: false });

            console.log('✌️error --->', error);
        }
    };

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

    const handlePrint = (item: any) => {
        window.location.href = `/invoice/invoiceReports?id=${item.id}`;
    };

    const handlePreviewClick = (id: any) => {
        var id: any = id;
        var url = `/invoice/preview?id=${id}`;
        window.open(url, '_blank');
    };

    const handleAmountInput = (e: any) => {
        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, ''); // Remove non-numeric characters
    };

    return !state.isAdmin ? (
        <InvoiceData data={state.details} taxData={state.taxData} testList={state.testList} paymentList={state.paymentList} checkedItems={state.checkedItems} invoiceId={id} />
    ) : (
        <Spin size="large" spinning={state.loading} delay={500}>
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
                                    <CustomSelect
                                        onSearch={(data: any) => customerSearch(data)}
                                        value={state.customerName}
                                        options={state.customerList}
                                        className=" flex-1"
                                        onChange={(selectedOption: any) => {
                                            updateInvoiceCustomer(selectedOption);
                                            customersList(state.customerCurrentPage);
                                        }}
                                        loadMore={() => {
                                            if (state.customerHasNext) {
                                                customersList(state.customerCurrentPage + 1);
                                                // setState({ customerCurrentPage: state.customerCurrentPage + 1 });
                                            }
                                        }}
                                        isSearchable
                                        filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                                    />

                                    {/* <select id="country" className="form-select flex-1" name="customer" onChange={handleSelectChange}>
                                    {state.details?.customers?.map((value: any) => (
                                        <option key={value.id} value={value.id}>
                                            {value?.customer_name}
                                        </option>
                                    ))}
                                </select> */}
                                </div>

                                <div className="mt-4 flex items-center">
                                    <label htmlFor="reciever-address" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Address
                                    </label>
                                    <textarea id="reciever-address" name="reciever-address" className="form-input flex-1" value={state.customerAddress} placeholder="Enter Address" />
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
                                        value={state?.project_name}
                                        onChange={inputChange}
                                        placeholder="Enter Email"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="w-full lg:w-1/2">
                                <div className="text-lg"></div>

                                <div className="mt-4 flex items-center">
                                    <label htmlFor="number" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Invoice Number
                                    </label>
                                    <input id="number" type="text" className="form-input flex-1 cursor-not-allowed" name="invoice_no" defaultValue={state.details?.invoice_no} disabled />
                                </div>
                                <div className="mt-4 flex items-center">
                                    <label htmlFor="startDate" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Invoice Date
                                    </label>
                                    <input id="startDate" type="date" className="form-input flex-1" name="date" value={state.date} onChange={inputChange} />
                                </div>
                                <div className="mt-4 flex items-center">
                                    <label htmlFor="place_of_testing" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Place of testing
                                    </label>
                                    <input id="place_of_testing" type="text" className="form-input flex-1" name="place_of_testing" value={state.place_of_testing} onChange={inputChange} />
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
                                    {state.testList?.length > 0 ? (
                                        state.testList?.map((item: any, index: any) => {
                                            return (
                                                <tr className="align-top" key={item.id}>
                                                    <td>{item.test_name}</td>
                                                    <td>{Number(item?.qty)}</td>
                                                    <td> {Number(item?.price_per_sample)} </td>
                                                    <td>{item.qty * item.price_per_sample}</td>
                                                    <td>
                                                        <Space>
                                                            <EditOutlined rev={undefined} className="edit-icon" onClick={() => showDrawer(item)} />
                                                            {state.testDeleteLoading && state.deletingId == item?.id ? (
                                                                <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2 " />
                                                            ) : (
                                                                <DeleteOutlined
                                                                    rev={undefined}
                                                                    style={{ color: 'red', cursor: 'pointer' }}
                                                                    className="delete-icon"
                                                                    onClick={() => handleDelete(item?.id)}
                                                                />
                                                            )}
                                                        </Space>
                                                    </td>
                                                    <td>{item?.completed}</td>
                                                    <td>
                                                        <PrinterOutlined rev={undefined} className="edit-icon" onClick={() => handlePrint(item)} />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="!text-center font-semibold">
                                                No Item Available
                                            </td>
                                        </tr>
                                    )}
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
                                    {state.paymentList?.length > 0 ? (
                                        state.paymentList?.map((item: any, index: any) => {
                                            return (
                                                <tr className="align-top" key={item.id}>
                                                    <td>{item?.payment_mode}</td>
                                                    <td>{item?.cheque_number}</td>
                                                    <td>{item?.upi} </td>
                                                    <td>{item?.neft} </td>
                                                    <td>{item?.tds} </td>
                                                    <td>{roundNumber(item?.amount)}</td>
                                                    <td>{item?.date ? commomDateFormat(item?.date) : ''}</td>
                                                    <td>
                                                        <Space>
                                                            <EditOutlined rev={undefined} className="edit-icon" onClick={() => showPaymentDrawer(item)} />
                                                            {localStorage.getItem('admin') === 'true' && (
                                                                <DeleteOutlined
                                                                    rev={undefined}
                                                                    style={{ color: 'red', cursor: 'pointer' }}
                                                                    className="delete-icon"
                                                                    onClick={() => PaymentDelete(item?.id)}
                                                                />
                                                            )}
                                                        </Space>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="!text-center font-semibold">
                                                No Item Available
                                            </td>
                                        </tr>
                                    )}
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
                                <div className="mt-4 flex items-center justify-between">
                                    <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Total Amount
                                    </label>
                                    <input
                                        id="bank-name"
                                        type="text"
                                        className="form-input flex-1 cursor-not-allowed"
                                        name="test-total-amount "
                                        value={roundNumber(state.total_amount)}
                                        placeholder="Enter Sub Total"
                                        disabled
                                    />
                                </div>
                                <div className="mt-4 flex w-full items-center justify-between">
                                    <div className="flex w-1/3  items-center">
                                        <label htmlFor="bank-name" className="mb-0 ltr:mr-2 rtl:ml-2">
                                            Discount (%)
                                        </label>
                                        <div onClick={() => setState({ isOpenDiscount: true })} className=" cursor-pointer items-center pl-4 text-[#972e25] underline">
                                            Update
                                        </div>
                                    </div>
                                    <div className="flex w-2/3 items-center  ">
                                        <input
                                            id="bank-name"
                                            type="number"
                                            className="form-input flex-1 cursor-not-allowed"
                                            name="discount"
                                            value={state?.discount}
                                            // onChange={(e) => handleDiscountChange(e.target.value)}
                                            placeholder="Enter Discount"
                                            disabled={true}
                                            style={{ cursor: 'not-allowed' }}
                                        />
                                    </div>
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
                                        className="form-input flex-1 cursor-not-allowed"
                                        name="before_tax"
                                        value={roundNumber(state?.before_tax_amount)}
                                        onChange={inputChange}
                                        placeholder="Enter Before Tax"
                                        disabled
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <label htmlFor="country" className="mb-0 w-1/6 ltr:mr-2 rtl:ml-2">
                                        Tax
                                    </label>

                                    {state.taxes?.map((item: any) => {
                                        return (
                                            <div key={item.id}>
                                                <label>
                                                    <input type="checkbox" value={item.tax_name} checked={item?.enabled} onChange={() => handleChange(item.tax_name)} style={{ marginRight: '5px' }} />
                                                    {item.tax_name}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                                {state.taxData && (
                                    <strong className="flex items-center justify-between" style={{ marginTop: '20px' }}>
                                        {state.taxData}
                                    </strong>
                                )}
                                <div className="mt-4 flex items-center justify-between">
                                    <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        After Tax
                                    </label>
                                    <input
                                        id="bank-name"
                                        type="text"
                                        className="form-input flex-1 cursor-not-allowed"
                                        name="after_tax"
                                        value={roundNumber(state.after_tax_amount)}
                                        placeholder="Enter After Tax"
                                        disabled
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Advance
                                    </label>
                                    <input id="swift-code" type="text" className="form-input flex-1 cursor-not-allowed" name="advance" value={roundNumber(state.advance)} disabled />
                                </div>
                                <div className="mt-4 flex items-center justify-between font-semibold">
                                    <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Balance
                                    </label>
                                    <input id="swift-code" type="text" className="form-input flex-1 cursor-not-allowed" name="balance" value={roundNumber(state.balance)} disabled />
                                </div>
                                <div className="mt-4 flex items-center justify-start font-semibold">
                                    <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Completed
                                    </label>
                                    <label style={{ marginRight: '3px', marginBottom: '0px' }}>Yes</label>
                                    <input id="swift-code-yes" type="radio" style={{ marginRight: '20px' }} name="completed" value="Yes" onChange={inputUpdate} checked={state?.completed === 'Yes'} />
                                    <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                                    <input id="swift-code-no" type="radio" name="completed" value="No" onChange={inputUpdate} checked={state?.completed === 'No'} />
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
                                                        onClick={handleSubmit}
                                                    >
                                                        <IconSave className="ltr:mr-2 rtl:ml-2 shrink-0" />
                                                        Update
                                                    </button>
                                                )
                                            } */}

                                        <button type="button" className="btn btn-civil w-full gap-2" onClick={handleSubmit}>
                                            {state.btnLoading ? (
                                                <IconLoader className="shrink-0 ltr:mr-2 rtl:ml-2 " />
                                            ) : (
                                                <>
                                                    <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                    Update
                                                </>
                                            )}
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

                <Modal
                    title={'Create Test'}
                    open={state.isModalOpen}
                    width={900}
                    onOk={() => {
                        form1.resetFields();
                        setState({ isModalOpen: false, tableToggleVisible: false, filterTest: [], testMaterialList: [] });
                    }}
                    onCancel={() => {
                        form1.resetFields();
                        setState({ isModalOpen: false, tableToggleVisible: false, filterTest: [], testMaterialList: [] });
                    }}
                    footer={false}
                >
                    <Form name="basic" onFinish={createTest} layout="vertical" form={form1}>
                        {/* Material Name Select */}
                        <Form.Item label="Material Name" name="material_id" rules={[{ required: true, message: 'Please select a Material Name!' }]}>
                            <CustomSelect
                                options={Dropdown(state.materialNameList?.materials, 'material_name') || []}
                                onChange={(selectedOption: any) => {
                                    form1.setFieldsValue({ material_id: selectedOption });
                                    materialChange(selectedOption?.value);
                                }}
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        {/* Test Select */}
                        <Form.Item label="Test" name="test" rules={[{ required: true, message: 'Please select one or more tests!' }]}>
                            <CustomSelect
                                isMulti
                                options={state.testMaterialList}
                                onChange={(selectedOptions: any) => {
                                    const values = selectedOptions ? (Array.isArray(selectedOptions) ? selectedOptions.map((opt) => opt) : [selectedOptions]) : [];
                                    form1.setFieldsValue({ test: values });
                                    TestChange(values);
                                }}
                                placeholder="Select one or more tests"
                                isSearchable
                                filterOption={(input: string, option: any) => option.label.toLowerCase().includes(input.toLowerCase())}
                            />
                        </Form.Item>

                        {/* Rest of your form remains the same */}
                        <Form.Item>
                            <Button className="getInfoBtn" onClick={() => setState({ tableToggleVisible: !state.tableToggleVisible })}>
                                {state.tableToggleVisible ? 'Hide Info' : 'Get Info'}
                            </Button>
                        </Form.Item>

                        {/* Table section remains unchanged */}
                        {state.tableToggleVisible &&
                            (state.filterTest?.length > 0 ? (
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
                                            {state.filterTest.map((item: any, index: any) => {
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
                                                                min={1}
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
                            ) : (
                                <tr>
                                    <td colSpan={5} className="!text-center font-semibold">
                                        No Item Available
                                    </td>
                                </tr>
                            ))}

                        <div style={{ paddingTop: '30px' }}>
                            <Form.Item>
                                <Button type="primary" htmlType="submit">
                                    {state.testLoading ? <IconLoader className=" h-4 w-4 animate-spin" /> : 'Create'}
                                </Button>
                            </Form.Item>
                        </div>
                    </Form>
                </Modal>

                <Drawer
                    title="Edit Test"
                    placement="right"
                    width={600}
                    onClose={() => {
                        form.resetFields();
                        setState({ isOpen: false });
                    }}
                    open={state.isOpen}
                >
                    <Form name="basic" layout="vertical" form={form} initialValues={{ remember: true }} onFinish={updateTest} autoComplete="off">
                        <Form.Item label="Test Name" name="test_name" required={false} rules={[{ required: true, message: 'Please input your Test Name!' }]}>
                            <Input disabled />
                        </Form.Item>

                        <Form.Item label="Quantity" name="quantity" required={false} rules={[{ required: true, message: 'Please input your Quantity!' }]}>
                            <Input onChange={(e) => handleQuantityChange(e.target.value)} />
                        </Form.Item>

                        <Form.Item label="Price Per Sample" name="price_per_sample" required={false} rules={[{ required: true, message: 'Please input your Price Per Sample!' }]}>
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
                                    <Button
                                        danger
                                        htmlType="submit"
                                        onClick={() => {
                                            form.resetFields();
                                            setState({ isOpen: false });
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit">
                                        {state.testLoading ? <IconLoader className=" h-4 w-4 animate-spin" /> : 'Submit'}
                                    </Button>
                                </Space>
                            </div>
                        </Form.Item>
                    </Form>
                </Drawer>

                <Modal
                    title={state.paymentId ? 'Edit Payment' : 'Add Payment'}
                    open={state.isOpenPayment}
                    width={600}
                    onOk={() => setState({ isOpenPayment: false })}
                    onCancel={() => setState({ isOpenPayment: false, paymentId: null, payment_mode: { value: 'cash', label: 'Cash' }, paymentAmount: '', paymentDate: '' })}
                    footer={false}
                >
                    <form>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Amount Paid Date</label>
                            <input type="date" required className="form-input flex-1" name="paymentDate" value={state.paymentDate} onChange={inputChange} />
                            {/* {state.paymentDate === '' && <p style={{ color: 'red' }}>Amount Paid Date is required</p>} */}
                        </div>

                        <div style={{ marginBottom: '10px' }}>
                            <label htmlFor="payment-mode" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                Payment Mode
                            </label>
                            <div style={{ marginTop: '10px' }}>
                                <CustomSelect
                                    value={state?.payment_mode}
                                    options={PAYMENT_MODE_OPTIONS}
                                    onChange={(selectedOption: any) => {
                                        setState({ payment_mode: selectedOption, payment_number: '' });
                                    }}
                                />
                            </div>
                        </div>
                        {state?.payment_mode?.value !== 'cash' && (
                            <div style={{ marginBottom: '10px' }}>
                                <>
                                    <label htmlFor="cheque" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        {state?.payment_mode?.value === 'upi'
                                            ? 'UPI Ref'
                                            : state?.payment_mode?.value === 'cheque'
                                            ? 'Cheque Number'
                                            : state?.payment_mode?.value === 'neft'
                                            ? 'Neft'
                                            : state?.payment_mode?.value === 'tds'
                                            ? 'TDS'
                                            : null}
                                    </label>
                                    <input id="cheque-number" type="text" className="form-input flex-1" name="payment_number" value={state.payment_number} onChange={inputChange} required />
                                </>
                            </div>
                        )}

                        <div style={{ marginBottom: '10px' }}>
                            <label>Amount</label>
                            <input
                                className="form-input flex-1"
                                name="amount"
                                value={state?.paymentAmount}
                                required
                                onChange={(e) => setState({ paymentAmount: e.target.value })}
                                pattern="[0-9]*"
                                onInput={handleAmountInput}
                            />
                        </div>
                        <div style={{ paddingTop: '30px' }}>
                            <Button type="primary" htmlType="button" onClick={state.paymentId ? updatePayment : addPayment} loading={state.paymentLoading}>
                                {state.paymentId ? 'Update' : 'Add'}
                            </Button>
                        </div>
                    </form>
                </Modal>

                <Drawer
                    title={'Update Invoice Discount'}
                    placement="right"
                    width={600}
                    onClose={() => {
                        setState({ isOpenDiscount: false });
                    }}
                    open={state.isOpenDiscount}
                >
                    <Form name="basic-form" layout="vertical" initialValues={{ remember: true }} onFinish={(value) => updateDiscount(value)} autoComplete="off" form={form2}>
                        <Form.Item label="Invoice Number" name="invoice_no" required={false} rules={[{ required: true, message: 'Please select customer name!' }]}>
                            <Input type="text" placeholder="Invoice Number" value={state.invoice_no} disabled className="form-input flex-1 cursor-not-allowed" />
                        </Form.Item>

                        <Form.Item label="Discount (%)" name="discount" required={false} rules={[{ required: true, message: 'Please enter discount !' }]}>
                            <Input type="number" placeholder="Discount" />
                        </Form.Item>

                        <Form.Item>
                            {/* <Space> */}
                            <div className="form-btn-main">
                                <Space>
                                    <Button danger htmlType="submit" onClick={() => setState({ isOpenDiscount: false, customerData: {} })}>
                                        Cancel
                                    </Button>
                                    <Button type="primary" htmlType="submit" loading={state.discountLoading}>
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
            </div>
        </Spin>
    );
}
