import { PrinterOutlined } from '@ant-design/icons';
import React from 'react';
import IconEye from '../Icon/IconEye';
import { roundNumber } from '@/utils/function.util';

export default function invoiceData(props: any) {
    const { data, checkedItems, invoiceId, testList, paymentList, taxData } = props;

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
                                <input id="reciever-email" type="text" className="form-input flex-1 cursor-not-allowed" name="project_name" value={data?.project_name} placeholder="" disabled />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="text-lg"></div>

                            <div className="mt-4 flex items-center">
                                <label htmlFor="number" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Invoice Number
                                </label>
                                <input id="number" type="text" className="form-input flex-1 cursor-not-allowed" name="invoice_no" defaultValue={data?.invoice_no} disabled />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="startDate" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Invoice Date
                                </label>
                                <input id="startDate" type="date" className="form-input flex-1 cursor-not-allowed" name="date" value={data?.date} disabled />
                            </div>
                            <div className="mt-4 flex items-center">
                                <label htmlFor="place_of_testing" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Place of testing
                                </label>
                                <input id="place_of_testing" type="text" className="form-input flex-1 cursor-not-allowed" name="place_of_testing" value={data?.place_of_testing} disabled />
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
                                {testList?.length > 0 ? (
                                    testList?.map((item: any, index: any) => {
                                        return (
                                            <tr className="align-top" key={item.id}>
                                                <td>{item.test_name}</td>
                                                <td>{Number(item?.qty)}</td>
                                                <td> {Number(item?.price_per_sample)} </td>
                                                <td>{item.qty * item.price_per_sample}</td>
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
                                {paymentList?.length > 0 ? (
                                    paymentList?.map((item: any, index: any) => {
                                        return (
                                            <tr className="align-top" key={item.id}>
                                                <td>{item?.payment_mode}</td>
                                                <td>{item?.cheque_number}</td>
                                                <td>{item?.upi} </td>
                                                <td>{roundNumber(item?.amount)}</td>
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
                                    // value={data?.invoice?.amount}
                                    value={roundNumber(data?.total_amount)}
                                    placeholder="Enter Sub Total"
                                    disabled
                                />
                            </div>
                            {data?.invoice_discounts?.length > 0 && data?.invoice_discounts[0]?.discount > 0 && (
                                <div className="mt-4 flex items-center justify-between">
                                    <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                        Discount (%)
                                    </label>
                                    <input
                                        id="bank-name"
                                        type="text"
                                        className="form-input flex-1 cursor-not-allowed"
                                        name="discount"
                                        value={roundNumber(data?.invoice_discounts[0]?.discount)}
                                        placeholder="Enter Discount"
                                        disabled={true}
                                    />
                                </div>
                            )}
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Before Tax
                                </label>
                                <input id="bank-name" type="text" className="form-input flex-1" name="before_tax" value={roundNumber(data?.before_tax_amount)} placeholder="Enter Before Tax" disabled />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="country" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Tax
                                </label>

                                {data?.invoice_taxes?.map((item: any) => {
                                    return (
                                        <div key={item.id}>
                                            <label>
                                                <input type="checkbox" value={item?.tax_name} checked={item?.enabled} style={{ marginRight: '5px' }} />
                                                {item?.tax_name}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                            {taxData && (
                                <strong className="flex items-center justify-between" style={{ marginTop: '20px' }}>
                                    {taxData}
                                </strong>
                            )}
                            {/* {formatTotal() && <p dangerouslySetInnerHTML={{ __html: formatTotal() }}></p>} */}
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="bank-name" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    After Tax
                                </label>
                                <input id="bank-name" type="text" className="form-input flex-1" name="after_tax" value={roundNumber(data?.after_tax_amount)} placeholder="Enter After Tax" disabled />
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Advance
                                </label>
                                <input id="swift-code" type="text" className="form-input flex-1" name="advance" value={roundNumber(data?.advance)} disabled />
                            </div>
                            <div className="mt-4 flex items-center justify-between font-semibold">
                                <label htmlFor="swift-code" className="mb-0 w-1/3 ltr:mr-2 rtl:ml-2">
                                    Balance
                                </label>
                                <input id="swift-code" type="text" className="form-input flex-1" name="balance" value={roundNumber(data?.balance)} disabled />
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
                                    checked={data?.completed === 'Yes'}
                                    className="cursor-not-allowed"
                                />
                                <label style={{ marginRight: '3px', marginBottom: '0px' }}>No</label>
                                <input id="swift-code-no" type="radio" name="completed" value="No" checked={data?.completed === 'No'} className="cursor-not-allowed" />
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
