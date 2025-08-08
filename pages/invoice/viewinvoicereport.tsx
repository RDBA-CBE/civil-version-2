import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { baseUrl, commomDateFormat, roundNumber, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';

const Preview = () => {
    const router = useRouter();
    const { id } = router.query;

    const [state, setState] = useSetState({
        detail: {},
        testList: [],
    });

    useEffect(() => {
        getInvoice();
        testList();
    }, [id]);

    // const getData = async () => {
    //     try {
    //         const res: any = await Models.invoice.invoiceDetails(id);
    //         if (res?.tax?.length > 0) {
    //             const taxNames = res?.tax.map((tax: any) => tax.tax_name);
    //             const taxPercentages = res?.tax.map((tax: any) => tax.tax_percentage.split('.')[0] + '%');
    //             const result = `${taxNames.join(' + ')} : ${taxPercentages.join(' + ')}`;
    //             const totalPercentage = res?.after_tax_amount - res?.before_tax_amount;
    //             setState({ taxData: result, totalPercentage: roundNumber(totalPercentage) });
    //         }
    //         setState({ detail: res });
    //     } catch (error) {
    //         console.log('✌️error --->', error);
    //     }
    // };

    const getInvoice = async () => {
        try {
            setState({ loading: true });
            const res: any = await Models.invoice.invoiceDetails(id);

            if (res?.invoice_taxes?.length > 0) {
                const taxes = res.invoice_taxes.filter((item:any) => item.enabled);
                const taxNames = taxes.map((tax:any) => tax.tax_name);
                const taxPercentages = taxes.map((val:any) => `${val.tax_percentage}%`);
                const result = `${taxNames.join(' + ')} : ${taxPercentages.join(' + ')}`;
                const totalPercentage = res.after_tax_amount - res.before_tax_amount;
                setState({
                    taxData: result,
                    totalPercentage: roundNumber(totalPercentage),
                });
            }

            setState({
                invoiceData: res,
                loading: false,
                detail: res,
            });
        } catch (error) {
            setState({ loading: false });
            console.error('Error fetching invoice:', error);
        }
    };

    const testList = async () => {
        try {
            const res: any = await Models.invoice.testList(id);
            setState({ testList: res });
        } catch (error: any) {
            console.log('✌️error --->', error);
        }
    };

    return (
        <>
            {/* {printData?.invoice?.is_old_invoice_format ? (
                <div>
                    <style
                        type="text/css"
                        dangerouslySetInnerHTML={{
                            __html: '\n.style3 {\n\tfont-size: 22px;\n\tfont-weight: bold;\n}\n\ntable td, th {\n\tfont-size: 13px;\n}\n',
                        }}
                    />
                    <div className="container" style={{ padding: '10px 0px' }}>
                        <div className="panel">
                            <div className="flex grid-cols-3  justify-between gap-4">
                                <div>
                                    <div className="invoice-head text-3xl font-semibold uppercase">Invoice</div>
                                    <p className="invoice-number">Invoice No : {printData?.invoice?.invoice_no}</p>
                                </div>

                                <div className="grid-cols-9 pl-7 ltr:text-right rtl:text-left">
                                    <div className="shrink-0" style={{ display: 'flex', justifyContent: 'end' }}>
                                        <img src="/assets/images/old-logo.png" alt="img" style={{ width: '75%' }} className="w-17 ltr:ml-auto rtl:mr-auto" />
                                    </div>
                                    <div className="mt-0 space-y-1 text-right text-white-dark">
                                        <div className="invoice-right">
                                            <b>An ISO/IEC 17025:2017 CERTIFIED LAB</b>
                                            <br></br>
                                            411/4, Ballu Naidu Thottam,Vijayalakshmi Nagar,<br></br>
                                            Neelikonampalayam Po, Coimbatore - 6410333.<br></br>
                                            <b>GSTIN : 33AATFC1831C1ZT</b>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-2 border-white-light dark:border-[#1b2e4b]" />
                            <div className="preview-header ">
                                <div className="mb-3 pr-3 sm:w-full md:w-1/2 lg:w-1/2 ">
                                    <div className="space-y-1 text-white-dark">
                                        <div>Issued For:</div>
                                        <div className="font-semibold text-black dark:text-white">
                                            {printData?.customer?.customer_name} <br />
                                            {printData?.customer?.address1}
                                            <br></br>
                                            <div className="space-y-1 text-white-dark">
                                                -Original for Recipient<br></br>
                                                -Duplicate for Supplier Transporter<br></br>
                                                -Triplicate for Supplier
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="issue_date  mt-3 sm:flex-row  md:w-1/2  lg:w-1/2">
                                    <div className=" ">
                                        <div className="mb-1 flex w-full items-center justify-between">
                                            <div className="text-white-dark">Date:</div>
                                            <div>{printData?.invoice?.date}</div>
                                        </div>

                                        <div className="mb-1 flex w-full items-center justify-between">
                                            <div className="text-white-dark">Project Name:</div>
                                            <div>{printData?.invoice?.project_name}</div>
                                        </div>
                                        <div className="mb-1 flex w-full items-center justify-between">
                                            <div className="text-white-dark">Place of Testing:</div>
                                            <div>{printData?.invoice?.place_of_testing}</div>
                                        </div>
                                        <div className="mb-1 flex w-full items-center justify-between">
                                            <div className="text-white-dark"> GSTIN/UIN:</div>
                                            <div>{printData?.customer?.gstin_no}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="table-responsive invoice-table mt-3">
                                <table className="table-striped">
                                    <thead style={{ border: '1px solid black' }}>
                                        <tr>
                                            <th style={{ border: '1px solid black' }}>S.No</th>
                                            <th style={{ border: '1px solid black' }}>Name of Test</th>
                                            <th style={{ border: '1px solid black' }}>HAN/SAC</th>
                                            <th style={{ border: '1px solid black' }}>Qty</th>
                                            <th style={{ textAlign: 'right', border: '1px solid black' }}>Rate/Sample(INR)</th>
                                            <th style={{ textAlign: 'right', border: '1px solid black' }}>Amount(INR)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {printData?.invoice_tests?.map((invoice: any, index: any) => {
                                            return (
                                                <>
                                                    <tr style={{ border: '1px solid black' }}>
                                                        <td style={{ border: '1px solid black' }}>{index + 1}</td>
                                                        <td style={{ border: '1px solid black' }}>
                                                            {invoice?.test_name} - <span style={{ fontWeight: 'bold' }}>{invoice?.material_name}</span>
                                                        </td>
                                                        <td style={{ border: '1px solid black' }}>998346</td>
                                                        <td style={{ border: '1px solid black' }}>{invoice?.qty}</td>
                                                        <td style={{ textAlign: 'right', border: '1px solid black' }}>{invoice?.price_per_sample}</td>
                                                        <td style={{ textAlign: 'right', border: '1px solid black' }}>{parseInt(invoice?.total, 10)}</td>
                                                    </tr>
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                <table>
                                    <thead></thead>
                                    <tbody>
                                        <tr style={{ border: 'none' }}>
                                            <td></td>
                                            <td></td>
                                            <td></td>
                                        </tr>
                                        <tr style={{ border: 'none' }}>
                                            <>
                                                <td>
                                                    <b>Name:</b> Covai Civil Tech Lab
                                                </td>

                                                {printData?.invoice?.discount >= 1 ? (
                                                    <>
                                                        <td style={{ textAlign: 'right' }}>Discount (%) </td>
                                                        <td style={{ textAlign: 'right' }}>{printData?.invoice?.discount}</td>
                                                    </>
                                                ) : null}
                                            </>
                                        </tr>
                                        <tr style={{ border: 'none' }}>
                                            <>
                                                <td>
                                                    <b>Account Number:</b> 584705000004{' '}
                                                </td>

                                                <td style={{ textAlign: 'right' }}>Before Tax</td>
                                                <td style={{ textAlign: 'right' }}>{BeforeTotal?.toFixed(2)}</td>
                                            </>
                                        </tr>

                                        <tr style={{ border: 'none' }}>
                                            <td>
                                                <b>Branch:</b> Saibaba colony branch, coimbatore.
                                            </td>

                                            <td style={{ textAlign: 'right' }}>{Discount()}</td>
                                            <td style={{ textAlign: 'right' }}>{Tax_total?.toFixed(2)}</td>
                                        </tr>

                                        <tr style={{ border: 'none' }}>
                                            <td>
                                                <b>IFSC Code:</b> ICIC0001550
                                            </td>

                                            <td style={{ textAlign: 'right' }}>Total</td>
                                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                                {parseInt(After_Tax)} <input type="hidden" id="amt" name="amt" defaultValue="11,446.00" />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <hr className="my-2 border-white-light dark:border-[#1b2e4b]" />
                            <div className="preview-footer-main">
                                <div className="preview-qr-outer1">
                                    <img src="/assets/images/Sponsor.jpg" className="preview-qr-outer1_img" alt="image" />
                                </div>

                                {printData?.invoice?.invoice_no === null ? (
                                    <></>
                                ) : (
                                    <>
                                        <div className="preview-qr-outer2">
                                            <img src={printData?.invoice?.qr} className="preview-qr-outer2_img" alt="image" />
                                        </div>
                                    </>
                                )}

                                <div className="preview-qr-outer3">
                                    <div className="sign-footer mt-0 grid-cols-9 space-y-1 text-right text-right text-sm text-white-dark">
                                        <img src="/assets/images/sign.png" alt="img" style={{ marginLeft: 'auto' }} />
                                        <br />
                                        COVAI CIVIL TECH LAB <br /> R.TIRUMALAI (TECHNICAL DIRECTOR)
                                        <div className="sign-footer mt-0 space-y-1 text-right text-sm text-white-dark">
                                            <b>Phone</b> : <a href="tel:9840014193"> 9840014193 </a>|<br />
                                            <i>
                                                <b>Email :</b>{' '}
                                                <a href="mailto:cbe@covaiciviltechlab.com" target="_blank">
                                                    cbe@covaiciviltechlab.com{' '}
                                                </a>
                                            </i>{' '}
                                            <br />
                                            <i>
                                                <b>Website :</b>{' '}
                                                <a href="https://covaiciviltechlab.com/" target="blank">
                                                    covaiciviltechlab.com
                                                </a>
                                            </i>
                                            <br></br>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="footer-decleration container">
                        {' '}
                        <div style={{ textAlign: 'center', padding: '10px 10px 0px 10px' }}>
                            <b>Declaration:-</b> We declare that this invoice shows the actual price of the Test Services described and that all particulars are true and correct. <br /> <br />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            SUBJECT TO COIMBATORE JURISDICTION
                            <br /> This is computer Generated Invoice.
                        </div>
                    </div>
                </div>
            ) : ( */}
            <div>
                <style
                    type="text/css"
                    dangerouslySetInnerHTML={{
                        __html: '\n.style3 {\n\tfont-size: 22px;\n\tfont-weight: bold;\n}\n\ntable td, th {\n\tfont-size: 13px;\n}\n',
                    }}
                />
                <div className="container" style={{ padding: '10px 0px' }}>
                    <div className="panel">
                        <div className="flex grid-cols-3  justify-between gap-4">
                            <div>
                                <div className="invoice-head text-3xl font-semibold uppercase">Invoice</div>
                                <p className="invoice-number">Invoice No : {state.detail?.invoice_no}</p>
                            </div>

                            <div className="grid-cols-9 pl-7 ltr:text-right rtl:text-left">
                                <div className="shrink-0" style={{ display: 'flex', justifyContent: 'end' }}>
                                    <img src="/assets/images/logo-in.png" alt="img" style={{ width: '75%' }} className="w-17 ltr:ml-auto rtl:mr-auto" />
                                </div>
                                <div className="mt-0 space-y-1 text-right text-white-dark">
                                    <div className="invoice-right">
                                        <b>An ISO/IEC 17025:2017 CERTIFIED LAB</b>
                                        <br></br>
                                        411/4, Vijayalakshmi Nagar,<br></br>
                                        Neelikonampalayam Po, Coimbatore - 6410333.<br></br>
                                        <b>GSTIN : 33AALCC7761L1Z7</b>
                                        <br />
                                        <b>CIN : U71200TZ2024PTC031215 </b>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-2 border-white-light dark:border-[#1b2e4b]" />
                        <div className="preview-header ">
                            <div className="mb-3 pr-3 sm:w-full md:w-1/2 lg:w-1/2 ">
                                <div className="space-y-1 text-white-dark">
                                    <div>Issued For:</div>
                                    <div className="font-semibold text-black dark:text-white">
                                        {state.detail?.customer?.customer_name} <br />
                                        {state.detail?.customer?.address1}
                                        <br></br>
                                        <div className="space-y-1 text-white-dark">
                                            -Original for Recipient<br></br>
                                            -Duplicate for Supplier Transporter<br></br>
                                            -Triplicate for Supplier
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="issue_date  mt-3 sm:flex-row  md:w-1/2  lg:w-1/2">
                                <div className=" ">
                                    <div className="mb-1 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Date:</div>
                                        <div>{commomDateFormat(state.detail?.date)}</div>
                                    </div>

                                    <div className="mb-1 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Project Name:</div>
                                        <div>{state.detail?.project_name}</div>
                                    </div>
                                    <div className="mb-1 flex w-full items-center justify-between">
                                        <div className="text-white-dark">Place of Testing:</div>
                                        <div>{state.detail?.place_of_testing}</div>
                                    </div>
                                    <div className="mb-1 flex w-full items-center justify-between">
                                        <div className="text-white-dark"> GSTIN:</div>
                                        <div>{state.detail?.customer?.gstin_no}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive invoice-table mt-3">
                            <table className="table-striped">
                                <thead style={{ border: '1px solid black' }}>
                                    <tr>
                                        <th style={{ border: '1px solid black' }}>S.No</th>
                                        <th style={{ border: '1px solid black' }}>Name of Test</th>
                                        <th style={{ border: '1px solid black' }}>HAN/SAC</th>
                                        <th style={{ border: '1px solid black' }}>Qty</th>
                                        <th style={{ textAlign: 'right', border: '1px solid black' }}>Rate/Sample(INR)</th>
                                        <th style={{ textAlign: 'right', border: '1px solid black' }}>Amount(INR)</th>
                                    </tr>
                                </thead>
                                {state.testList?.length > 0 && (
                                    <tbody>
                                        {state.testList?.map((invoice: any, index: any) => {
                                            return (
                                                <>
                                                    <tr style={{ border: '1px solid black' }}>
                                                        <td style={{ border: '1px solid black' }}>{index + 1}</td>
                                                        <td style={{ border: '1px solid black' }}>
                                                            {invoice?.test_name} - <span style={{ fontWeight: 'bold' }}>{invoice?.material_name}</span>
                                                        </td>
                                                        <td style={{ border: '1px solid black' }}>998346</td>
                                                        <td style={{ border: '1px solid black' }}>{invoice?.qty}</td>
                                                        <td style={{ textAlign: 'right', border: '1px solid black' }}>{roundNumber(invoice?.price_per_sample)}</td>
                                                        <td style={{ textAlign: 'right', border: '1px solid black' }}>{roundNumber(invoice.total)}</td>
                                                    </tr>
                                                </>
                                            );
                                        })}
                                    </tbody>
                                )}
                            </table>
                            <table>
                                <thead></thead>
                                <tbody>
                                    <tr style={{ border: 'none' }}>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                    <tr style={{ border: 'none' }}>
                                        <>
                                            <td>
                                                <b>Name:</b> Covai Civil Lab Private Limited
                                            </td>

                                            {/* {printData?.invoice?.discount >= 1 ? (
                                                    <>
                                                        <td style={{ textAlign: 'right' }}>Discount (%) </td>
                                                        <td style={{ textAlign: 'right' }}>{printData?.invoice?.discount}</td>
                                                    </>
                                                ) : null} */}

                                            {/* {state.detail?.invoice_discounts?.length > 0 && state.detail?.invoice_discounts[0]?.discount > 0 ? (
                                                <>
                                                    <td style={{ textAlign: 'right' }}>Discount (%) </td>
                                                    <td style={{ textAlign: 'right' }}>{roundNumber(state.detail?.invoice_discounts[0]?.discount)}</td>
                                                </>
                                            ) : null} */}

                                            {state.detail?.invoice_discounts?.length > 0 && state.detail?.invoice_discounts[0]?.discount > 0 ? (
                                                <>
                                                    <td style={{ textAlign: 'right' }}>Discount {roundNumber(state.detail?.invoice_discounts[0]?.discount)}% </td>
                                                    <td style={{ textAlign: 'right' }}>{roundNumber(state.detail?.discount)}</td>
                                                </>
                                            ) : null}
                                        </>
                                    </tr>
                                    <tr style={{ border: 'none' }}>
                                        <>
                                            <td>
                                                <b>Account Number:</b> 923020070722530{' '}
                                            </td>

                                            <td style={{ textAlign: 'right' }}>Before Tax</td>
                                            <td style={{ textAlign: 'right' }}>{roundNumber(state.detail?.before_tax_amount)}</td>

                                            {/* <td style={{ textAlign: 'right' }}>TDS Amount</td>
                                            <td style={{ textAlign: 'right' }}>{printData?.invoice?.tds_amount}</td> */}
                                        </>
                                    </tr>

                                    <tr style={{ border: 'none' }}>
                                        <td>
                                            <b>Bank Name & Branch:</b> Axis Bank, Vadavalli, Coimbatore.
                                        </td>

                                        {/* <td style={{ textAlign: 'right' }}>{Discount()}</td>
                                            <td style={{ textAlign: 'right' }}>{Tax_total?.toFixed(2)}</td> */}

                                        <td style={{ textAlign: 'right' }}>{state.taxData}</td>
                                        {state.taxData && <td style={{ textAlign: 'right' }}>{state.totalPercentage}</td>}
                                    </tr>

                                    <tr style={{ border: 'none' }}>
                                        <td>
                                            <b>IFSC Code:</b> UTIB0003080
                                        </td>

                                        <td style={{ textAlign: 'right' }}>Total</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                            {roundNumber(state.detail?.after_tax_amount)} <input type="hidden" id="amt" name="amt" />
                                            {/* {parseInt(After_Tax)} <input type="hidden" id="amt" name="amt" defaultValue="11,446.00" /> */}
                                        </td>
                                    </tr>

                                    {/* <tr style={{ border: 'none' }}></tr> */}
                                    {/* <tr style={{ border: 'none' }}>
                                        <td>{null}</td>

                                        
                                    </tr> */}
                                </tbody>
                            </table>
                        </div>

                        {/*footer */}
                        <hr className="my-2 border-white-light dark:border-[#1b2e4b]" />
                        <div className="preview-footer-main">
                            {/* <div className="preview-qr-outer1">
                                <img src="/assets/images/Sponsor.jpg" className="preview-qr-outer1_img" alt="image" />
                            </div> */}

                            {state.detail?.invoice_image && (
                                <div className="preview-qr-outer2">
                                    <img src={`${baseUrl}/${state.detail?.invoice_image}`} className="preview-qr-outer2_img" alt="image" />
                                </div>
                            )}

                            <div className="preview-qr-outer3">
                                <div className="sign-footer mt-0 grid-cols-9 space-y-1 text-right text-right text-sm text-white-dark">
                                    <img src="/assets/images/sign.png" alt="img" style={{ marginLeft: 'auto' }} />
                                    <br />
                                    Managing Directory,
                                    <br /> Covai Civil Lab Private Limited.
                                    {/* Covai Civil Lab Private Limited <br /> R.TIRUMALAI (TECHNICAL DIRECTOR) */}
                                    {/* <img src="/assets/images/logo_3.jpg" alt="img" style={{ marginLeft: "auto" }} /> */}
                                    <div className="sign-footer mt-0 space-y-1 text-right text-sm text-white-dark">
                                        <b>Phone</b> : <a href="tel:9840014193"> 9840014193 </a>|<br />
                                        <i>
                                            <b>Email :</b>{' '}
                                            <a href="mailto:cbe@covaicivillab.com" target="_blank">
                                                cbe@covaicivillab.com{' '}
                                            </a>
                                        </i>{' '}
                                        <br />
                                        <i>
                                            <b>Website :</b>{' '}
                                            <a href="https://covaicivillab.com/" target="blank">
                                                covaicivillab.com
                                            </a>
                                        </i>
                                        <br></br>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer-decleration container">
                    {' '}
                    <div style={{ textAlign: 'center', padding: '10px 10px 0px 10px' }}>
                        <b>Declaration:-</b> We declare that this invoice shows the actual price of the Test Services described and that all particulars are true and correct. <br /> <br />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        SUBJECT TO COIMBATORE JURISDICTION
                        <br /> This is computer Generated Invoice.
                    </div>
                </div>
            </div>
            {/* )} */}
        </>
    );
};

export default Preview;
