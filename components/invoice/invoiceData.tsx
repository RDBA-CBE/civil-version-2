import { PrinterOutlined } from '@ant-design/icons';
import React from 'react';
import IconEye from '../Icon/IconEye';

export default function invoiceData(props: any) {
    const { data, checkedItems, invoiceId } = props;

    const handlePrintEmployee = (item: any) => {
        const id = item.id;
        const ref = `/invoice/print/?id=${id}`;
        window.open(ref, '_blank'); // Note: "_blank" specifies a new tab or window
    };

    const handlePreviewClick = () => {
        var id: any = invoiceId;
        var url = `/invoice/preview?id=${id}`;
        window.open(url, '_blank');
    };

    return (
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
                                {/* <select id="country" className="form-select flex-1" name="customer" disabled> */}
                                <input
                                    id="reciever-email"
                                    type="text"
                                    className="form-input flex-1 cursor-not-allowed"
                                    name="project_name"
                                    value={data?.customer?.customer_name}
                                    placeholder="Enter Email"
                                    disabled
                                />
                                {/* </select> */}
                            </div>

                            <div className="mt-4 flex items-center">
                                <label htmlFor="reciever-address" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Address
                                </label>
                                <textarea
                                    id="reciever-address"
                                    name="reciever-address"
                                    className="form-input flex-1 cursor-not-allowed"
                                    value={data?.customer?.address1}
                                    placeholder="Enter Address"
                                    disabled
                                />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="reciever-email" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Project Name
                                </label>
                                <input
                                    id="reciever-email"
                                    type="text"
                                    className="form-input flex-1 cursor-not-allowed"
                                    name="project_name"
                                    value={data?.invoice?.project_name}
                                    placeholder=""
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
                                <input id="number" type="text" className="form-input flex-1 cursor-not-allowed" name="invoice_no" defaultValue={data?.invoice?.invoice_no} disabled />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="startDate" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Invoice Date
                                </label>
                                <input id="startDate" type="date" className="form-input flex-1 cursor-not-allowed" name="date" value={data?.invoice?.date} disabled />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="place_of_testing" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Place of testing
                                </label>
                                <input id="place_of_testing" type="text" className="form-input flex-1 cursor-not-allowed" name="place_of_testing" value={data?.invoice?.place_of_testing} disabled />
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
                                {data?.invoice_tests?.length > 0 ? (
                                    data?.invoice_tests?.map((item: any, index: any) => {
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
                                {data?.payments?.length > 0 ? (
                                    data?.payments?.map((item: any, index: any) => {
                                        return (
                                            <tr className="align-top" key={item.id}>
                                                <td>{item?.payment_mode}</td>
                                                <td>{item?.cheque_number}</td>
                                                <td>{item?.upi} </td>
                                                <td>{item?.amount}</td>
                                                <td>{item?.date}</td>
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
                        <div className="mb-6 sm:mb-0"></div>
                        <div className="sm:w-2/5">
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Total Amount
                                </label>
                                <input
                                    id="bank-name"
                                    type="text"
                                    className="form-input flex-1 cursor-not-allowed"
                                    name="test-total-amount"
                                    value={data?.invoice?.amount}
                                    placeholder="Enter Sub Total"
                                    disabled
                                />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Discount (%)
                                </label>
                                <input
                                    id="bank-name"
                                    type="text"
                                    className="form-input flex-1 cursor-not-allowed"
                                    name="discount"
                                    value={data?.customer?.customer_discount?.discount}
                                    placeholder="Enter Discount"
                                    disabled={true}
                                />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Before Tax
                                </label>
                                <input id="bank-name" type="text" className="form-input flex-1" name="before_tax" value={data?.before_tax} placeholder="Enter Before Tax" disabled />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="country" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Tax
                                </label>

                                {data?.taxs?.map((item: any) => {
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
                                {/* {formatTotal() && <p dangerouslySetInnerHTML={{ __html: formatTotal() }}></p>} */}
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    After Tax
                                </label>
                                <input id="bank-name" type="text" className="form-input flex-1" name="after_tax" value={data?.afterTax} placeholder="Enter After Tax" disabled />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Advance
                                </label>
                                <input id="swift-code" type="text" className="form-input flex-1" name="advance" value={data?.invoice?.advance} disabled />
                            </div>
                            <div className="mt-4 flex items-center justify-between font-semibold">
                                <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Balance
                                </label>
                                <input id="swift-code" type="text" className="form-input flex-1" name="balance" value={data?.balance} disabled />
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
                                    checked={data?.invoice?.completed === 'Yes'}
                                    className="cursor-not-allowed"
                                />
                                <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                                <input id="swift-code-no" type="radio" name="completed" value="No" checked={data?.invoice?.completed === 'No'} className="cursor-not-allowed" />
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

                                    <button className="btn btn-civil w-full gap-2" onClick={() => handlePreviewClick()}>
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
    );
}
