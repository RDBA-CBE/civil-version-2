import Models from '@/imports/models.import';
import { Dropdown, FormatTaxDisplay, roundNumber, useSetState } from '@/utils/function.util';
import React, { useEffect } from 'react';
import IconSave from '@/components/Icon/IconSave';
import IconEye from '@/components/Icon/IconEye';
import { Button, Modal, Form, Input, Select, Space, Drawer, message, Popconfirm } from 'antd';
import { useRouter } from 'next/router';
import { DeleteOutlined, EditOutlined, PrinterOutlined } from '@ant-design/icons';
import { baseUrl, Success } from '@/utils/function.util';
import { TAX } from '@/utils/constant';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import IconLoader from '@/components/Icon/IconLoader';
import CustomSelect from '@/components/Select';

export default function EditQoutations() {
    const router = useRouter();

    const { id } = router.query;

    const [form] = Form.useForm();

    const [form1] = Form.useForm();

    const [messageApi, contextHolder] = message.useMessage();

    const [state, setState] = useSetState({
        details: {},
        loading: false,
        checkedItems: {},
        isOpen: false,
        itemEditData: null,
        materialNameList: [],

        isAdmin: false,
        customerList: [],
        editData: null,
        isModalOpen: false,
        tableVisible: false,
        filterTest: [],
        isOpenPayment: false,
        discountOpen: false,
        btnLoading: false,
        tableToggleVisible: false,
        customerCurrentPage: 1,
        customerHasNext: null,
        payment_mode: { value: 'cash', label: 'Cash' },
        deletingId: null,
        discount: null,
        isDrawerOpen: false,
    });

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Quotation Edit'));
    });

    useEffect(() => {
        if (id) {
            getData();
            quotationItems();
            materialNameList();
        }
    }, [id]);

    const materialNameList = async () => {
        try {
            const res: any = await Models.invoice.materialNameList();
            setState({ materialNameList: res });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    const formatTaxDisplay = (selectedTaxes: any[], total: number) => {
        if (selectedTaxes.length === 0) return '';

        const names = selectedTaxes.map((tax) => tax.tax_name).join(' + ');
        const percentages = selectedTaxes.map((tax) => `${Math.round(parseFloat(tax.tax_percentage))}%`).join(' + ');

        return `${names} : ${percentages} = ${Math.round(total)}`;
    };

    const getData = async () => {
        try {
            const res: any = await Models.qoutation.qoutationDetail(id);

            if (res?.quotation_taxes?.length > 0) {
                const filter = res?.quotation_taxes?.filter((item: any) => item.enabled == true);
                setState({ checkedItems: filter, taxes: res?.quotation_taxes });
                const totalPercentage = roundNumber(res?.after_tax) - roundNumber(res?.before_tax);
                const taxData = formatTaxDisplay(filter, totalPercentage);
                setState({ taxData });
            } else {
                setState({ checkedItems: [], taxData: null });
            }
            setState({ detail: res, date: res?.date_created, completed: res?.completed });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const quotationItems = async () => {
        try {
            const res: any = await Models.qoutation.quotationItemsList(id);
            setState({ quotationItems: res });
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const handleDelete = (id: any) => {
        Modal.confirm({
            title: 'Are you sure to delete the Items record?',
            okText: 'Yes',
            okType: 'danger',
            onOk: () => {
                deleteRecord(id);
            },
        });
    };

    const deleteRecord = async (id: any) => {
        try {
            const res = await Models.qoutation.deleteItem(id);
            console.log('✌️res --->', res);
            quotationItems();
            getData();
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const handleSubmit = async () => {
        try {
            setState({ btnsLoading: true });
            const body = {
                date_created: state.date,

                completed: state.completed,
            };
            const res: any = await Models.qoutation.quotationUpdate(id, body);
            await getData();
            setState({ btnsLoading: false });
            Success('Quotation updated successfully');
        } catch (error) {
            setState({ btnsLoading: false });

            console.log('✌️error --->', error);
        }
    };

    const createTest = async (values: any) => {
        try {
            setState({ btnLoading: true });
            const body = state.filterTest.map((item: any) => ({
                test: item?.value,
                quantity: item.quantity,
                price_per_sample: Number(item.price),
                quotation: Number(id),
                material_id: values?.value,
            }));

            const res = await Models.qoutation.create(body);
            const bodyData = {
                date_created: state.date,

                completed: state.completed,
            };
            await Models.qoutation.quotationUpdate(id, bodyData);
            setState({ btnLoading: false, isModalOpen: false });
            await quotationItems();
            await getData();
            form1.resetFields();
            Success('Qutation items added successfully');
        } catch (error) {
            setState({ btnLoading: false });

            console.log('✌️error --->', error);
        }
    };

    const updateTest = async (values: any) => {
        try {
            setState({ btnLoading: true });
            const body = {
                quotation: id,
                test: state.itemEditData.test,
                quantity: Number(values.quantity),
                price_per_sample: values.price_per_sample,
                total: values.total,
            };

            const res = await Models.qoutation.update(state.itemEditData?.id, body);
            setState({ isDrawerOpen: false, btnLoading: false });
            await quotationItems();
            await getData();
            Success('Qutation items updated successfully');
        } catch (error) {
            console.log('✌️error --->', error);
        }
    };

    const inputChange = (e: any) => {
        setState({ [e.target.name]: e.target.value });
    };

    const handlePreviewClick = (id: any) => {
        var id: any = id;
        var url = `/invoice/quotationPreview?id=${id}`;
        window.open(url, '_blank');
    };

    const handleChange = async (clickedTaxName: string) => {
        try {
            const isIGST = clickedTaxName === 'IGST';
            const checked = state.taxes.map((tax: any) => ({
                ...tax,
                enabled: isIGST ? tax.tax_name === 'IGST' : ['CGST', 'SGST'].includes(tax.tax_name),
            }));

            setState({ taxes: checked });

            await Promise.all(
                checked.map((tax: any) =>
                    Models.qoutation.updateQuotationTax(tax?.id, {
                        enabled: tax.enabled,
                    })
                )
            );

            await getData();
        } catch (error) {
            console.error('Error in handleChange:', error);
            setState({ taxes: state.taxes });
        }
    };

    const showDrawer = (item: any) => {
        console.log('✌️item --->', item);
        if (state.completed) {
            messageApi.open({
                type: 'error',
                content: 'Kindly Change completed status to "NO" and update the Quotation, then add the test to Quotation.',
            });
        } else {
            form.setFieldsValue({
                test_name: item?.test_name,
                quantity: item?.quantity,
                price_per_sample: roundNumber(item?.price_per_sample),
                total: item?.total_price,
            });
            setState({ itemEditData: item, isDrawerOpen: true });
            // setEditRecord(item);
            // form.setFieldsValue(item);
            // setOpen(true);
        }
    };

    const showModal = () => {
        if (state.completed) {
            messageApi.open({
                type: 'error',
                content: 'Kindly Change completed status to "NO" and update the Quotation, then add the test to Quotation.',
            });
        } else {
            setState({ isModalOpen: true, itemEditData: null });
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

    return (
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
                                <input id="number" type="text" className="form-input flex-1" name="invoice_no" value={state.detail?.customer?.customer_name} disabled />

                                {/* <select id="country" disabled className="form-select flex-1" name="customer" onChange={handleSelectChange}>
                                        {invoiceFormData?.customer_list?.map((value: any) => (
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
                                <textarea id="reciever-address" name="reciever-address" disabled className="form-input flex-1" value={state.detail?.customer?.address1} placeholder="Enter Address" />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="text-lg"></div>

                            <div className="mt-4 flex items-center">
                                <label htmlFor="number" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Quotation Number
                                </label>
                                <input id="number" type="text" className="form-input flex-1" name="invoice_no" defaultValue={state.detail?.quotation_number} disabled />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="startDate" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Quotation Date
                                </label>
                                <input
                                    id="startDate"
                                    type="date"
                                    className="form-input flex-1"
                                    name="date"
                                    value={state.date}
                                    // disabled
                                    onChange={inputChange}
                                />
                            </div>
                            {/* <div className="mt-4 flex items-center">
                                        <label htmlFor="place_of_testing" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                            Place of testing
                                        </label>
                                        <input id="place_of_testing" type="text" className="form-input flex-1" name="place_of_testing" value={formData.place_of_testing} onChange={inputChange} />
                                    </div> */}
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
                                    {/* <th>Completed</th>
                                                        <th>Report</th> */}
                                </tr>
                            </thead>
                            <tbody>
                                {/* {invoiceFormData?.quotation_items?.length <= 0 && (
                                    <tr>
                                        <td colSpan={5} className="!text-center font-semibold">
                                            No Item Available
                                        </td>
                                    </tr>
                                )} */}
                                {state.quotationItems?.length > 0 ? (
                                    state.quotationItems?.map((item: any, index: any) => {
                                        return (
                                            <tr className="align-top" key={item.id}>
                                                <td>{item.test_name}</td>
                                                <td>{Number(item?.quantity)}</td>
                                                <td> {Number(item?.price_per_sample)} </td>
                                                <td>{item.quantity * item.price_per_sample}</td>
                                                <td>
                                                    <Space>
                                                        <EditOutlined rev={undefined} className="edit-icon" onClick={() => showDrawer(item)} />
                                                        <DeleteOutlined rev={undefined} style={{ color: 'red', cursor: 'pointer' }} className="delete-icon" onClick={() => handleDelete(item?.id)} />
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
                            <button type="button" className="btn btn-civil" onClick={showModal}>
                                Add Quotation Items
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col justify-between px-4 sm:flex-row">
                    <div className="mb-6 sm:mb-0"></div>
                    <div className="sm:w-2/5">
                        <div className="mt-4 flex items-center justify-between">
                            <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                Before Tax
                            </label>
                            <input
                                id="bank-name"
                                type="text"
                                className="form-input flex-1"
                                name="before_tax"
                                value={roundNumber(state.detail?.before_tax)}
                                // onChange={inputChange}
                                placeholder="Enter Before Tax"
                                disabled
                            />
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                            <label htmlFor="country" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
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
                            <input id="bank-name" type="text" className="form-input flex-1" name="after_tax" value={roundNumber(state.detail?.after_tax)} placeholder="Enter After Tax" disabled />
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
                                value="true"
                                onChange={() => setState({ completed: !state.completed })}
                                checked={state.completed}
                            />
                            <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                            <input id="swift-code-no" type="radio" name="completed" value="false" onChange={() => setState({ completed: !state.completed })} checked={!state.completed} />
                        </div>

                        <div style={{ marginTop: '50px' }}>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-1" style={{ display: 'flex' }}>
                                <button type="button" className="btn btn-civil  w-full gap-2" onClick={handleSubmit}>
                                    {state.btnsLoading ? (
                                        <IconLoader />
                                    ) : (
                                        <>
                                            <IconSave className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                            Update
                                        </>
                                    )}
                                </button>

                                <button className="btn btn-graygap-2  w-full" onClick={() => handlePreviewClick(id)}>
                                    <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                    Preview
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title={'Create Quotation Items'}
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
                            <Button type="primary" htmlType="submit" loading={state.btnLoading}>
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
                    setState({ isDrawerOpen: false });
                }}
                open={state.isDrawerOpen}
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
                                <Button type="primary" htmlType="submit" loading={state.btnLoading}>
                                    Submit
                                </Button>
                            </Space>
                        </div>
                    </Form.Item>
                </Form>
            </Drawer>
        </div>
    );
}
