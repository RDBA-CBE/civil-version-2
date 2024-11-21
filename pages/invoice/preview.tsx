import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { baseUrl } from '@/utils/function.util';

const Preview = () => {
    const router = useRouter();
    const { id } = router.query;
    const [printData, setPrintData] = useState<any>([]);

    useEffect(() => {
        axios
            .get(`${baseUrl}/print_invoice/${id}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setPrintData(res?.data);
            })
            .catch((error: any) => {
                if (error?.response?.status === 401) {
                    router.push('/');
                }
            });
    }, [id]);

    const TestTotal: any = printData?.invoice_tests?.reduce((accumulator: any, currentValue: any) => accumulator + parseFloat(currentValue.total || 0), 0);

    const Add_Discount = (TestTotal * printData?.invoice?.discount) / 100;

    const BeforeTotal = TestTotal - Add_Discount;
    console.log('✌️BeforeTotal --->', BeforeTotal);

    // Taxs
    const taxIds = printData?.invoice?.tax;

    const filteredTaxes = printData?.taxes?.filter((tax: any) => taxIds.includes(tax.id));
    console.log('✌️filteredTaxes --->', filteredTaxes);

    const Discount: any = () => {
        if (filteredTaxes?.length > 0) {
            const percentagesArray = filteredTaxes.map((item: any) => `${parseFloat(item.tax_percentage)}%`);

            const sum = percentagesArray.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0);
            console.log('✌️sum --->', sum);

            const selectedName = filteredTaxes.map((item: any) => item.tax_name);
            const nameString = selectedName.join(' + ');

            const percentagesString = percentagesArray.join(' + ');
            return `${nameString} : ${percentagesString}`;
        }
        return '';
    };

    // tax total amount

    const percentagesArray = filteredTaxes?.map((item: any) => parseFloat(item?.tax_percentage));

    var sum = percentagesArray?.reduce((accumulator: any, currentValue: any) => accumulator + currentValue, 0);

    const Tax_total = (BeforeTotal * sum) / 100;

    // after tax
    const After_Tax: any = BeforeTotal + Tax_total;

    console.log('printData', printData?.invoice);

    return (
        <>
            <div>
                <style
                    type="text/css"
                    dangerouslySetInnerHTML={{
                        __html: '\n.style3 {\n\tfont-size: 22px;\n\tfont-weight: bold;\n}\n\ntable td, th {\n\tfont-size: 13px;\n}\n',
                    }}
                />
                <div className="container" style={{ padding: '10px 0px' }}>
                    <div className="panel">
                        <div className="flex grid-cols-4  justify-between gap-3">
                            <div>
                                <div className="invoice-head text-3xl font-semibold uppercase">Invoice</div>
                                <p className="invoice-number">Invoice No : {printData?.invoice?.invoice_no}</p>
                            </div>

                            <div className="grid-cols-8 pl-7 ltr:text-right rtl:text-left">
                                <div className="shrink-0" style={{ display: 'flex', justifyContent: 'end' }}>
                                    <img src="/assets/images/logo-in.png" alt="img" style={{ width: '75%' }} className="w-17 ltr:ml-auto rtl:mr-auto" />
                                </div>
                                <div className="mt-0 space-y-1 text-right text-white-dark">
                                    <div className="invoice-right">
                                        <b>An ISO/IEC 17025:2017 CERTIFIED LAB</b>
                                        <br></br>
                                        411/4, Vijayalakshmi Nagar,<br></br>
                                        Neelikonampalayam Po, Coimbatore - 6410333.<br></br>
                                        <b>GSTIN : 33AALCC7761L1Z7</b><br/>
                                        <b>CIN : U71200TZ2024PTC031215 </b>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <hr className="my-2 border-white-light dark:border-[#1b2e4b]" />
                        <div className="preview-header ">
                            <div className="mb-3  pr-3 sm:w-full md:w-1/2 lg:w-1/2 ">
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
                                        <div className="text-white-dark"> GSTIN:</div>
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
                                                <b>Name:</b> Covai Civil Lab Private Limited
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
                                            <b>Account Number:</b> 923020070722530{' '}
                                            </td>

                                            <td style={{ textAlign: 'right' }}>Before Tax</td>
                                            <td style={{ textAlign: 'right' }}>{BeforeTotal?.toFixed(2)}</td>
                                            {/* <td style={{ textAlign: 'right' }}>TDS Amount</td>
                                            <td style={{ textAlign: 'right' }}>{printData?.invoice?.tds_amount}</td> */}
                                        </>
                                    </tr>

                                    <tr style={{ border: 'none' }}>
                                        <td>
                                        <b>Bank Name & Branch:</b> Axis Bank, Vadavalli, Coimbatore.
                                        </td>

                                        <td style={{ textAlign: 'right' }}>{Discount()}</td>
                                        <td style={{ textAlign: 'right' }}>{Tax_total?.toFixed(2)}</td>
                                    </tr>

                                    <tr style={{ border: 'none' }}>
                                        <td>
                                        <b>IFSC Code:</b> UTIB0003080
                                        </td>
                                        <td style={{ textAlign: 'right' }}>Total</td>
                                        <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                           {parseInt(After_Tax)} <input type="hidden" id="amt" name="amt"  />
                                        </td>
                                    </tr>

                                    {/* <tr style={{ border: 'none' }}></tr> */}
                                    {/* <tr style={{ border: 'none' }}>
                                        <td>
                                           {null}
                                        </td>

                                       
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
                                    Authorised Signatory,<br/> Covai Civil Lab Private Limited.
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
        </>
    );
};

export default Preview;
