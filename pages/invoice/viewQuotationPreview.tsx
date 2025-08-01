import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { baseUrl } from '@/utils/function.util'; // Ensure baseUrl is correctly imported
import BlankLayout from '@/components/Layouts/BlankLayout';
import { BorderBottomOutlined } from '@ant-design/icons';

const QuotationPreview = () => {
    const router = useRouter();
    const { id } = router.query;

    const [invoiceReport, setInvoiceReport] = useState<any>(null); // Initial state is null
    const [taxAmount, setTaxAmount] = useState<number>(0);
    const [afterTaxAmount, setAfterTaxAmount] = useState<number>(0);

    useEffect(() => {
        if (id) {
            getInvoiceTestData();
        }
    }, [id]);

    // Function to fetch invoice data
    const getInvoiceTestData = () => {
        axios
            .get(`${baseUrl}/quotations/${id}/`, {
                headers: {
                    Authorization: `Token ${localStorage.getItem('token')}`,
                },
            })
            .then((res) => {
                setInvoiceReport(res.data); // Set invoice report after fetching data

                // Extract the necessary tax info
                const selectedPercentages = res.data?.tax_list?.filter((item: any) => res.data.tax.includes(item.id));
                const totalTaxPercentage = selectedPercentages?.reduce((acc: number, item: any) => acc + parseFloat(item.tax_percentage), 0) || 0;

                const totalAmount = res.data?.total_amount || 0; // Fallback to 0 if no total_amount in the response

                // Calculate tax and after-tax amounts
                const TaxAmount = (totalAmount * totalTaxPercentage) / 100;
                const AfterTaxAmount = totalAmount + TaxAmount;

                // Set tax values into state
                setTaxAmount(TaxAmount);
                setAfterTaxAmount(AfterTaxAmount);
            })
            .catch((error) => {
                console.log('✌️error --->', error);
                // if (error.response?.status === 401) {
                //     router.push('/');
                // }
            });
    };

    const formatTotal = () => {
        const selectedPercentages = invoiceReport?.tax_list?.filter((item: any) => invoiceReport.tax.includes(item.id));
        if (selectedPercentages?.length > 0) {
            const formattedTaxDetails = selectedPercentages.map((item: any) => `${item.tax_name} (${parseFloat(item.tax_percentage)}%)`);
            return formattedTaxDetails.join('+ ');
        }
    };
    // Styles converted into JavaScript object format
    const styles: any = {
        body: {
            margin: 0,
            padding: 0,
            fontFamily: '"Nunito", serif',
            fontSize: '14px',
        },
        tableHead: {
            height: 'fit-content',
            width: '100%',
            margin: 'auto',
            marginTop: '20px',
            border: '1px solid rgb(192, 193, 195)',
            borderCollapse: 'collapse',
            borderBottom: 'none !important',
        },
        logo: {
            display: 'flex',
            justifyContent: 'center',
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
        },
        tableCell: {
            padding: '8px',
            border: '1px solid rgb(192, 193, 195)',
        },
        tableHeader: {
            textAlign: 'left',
        },
        signDiv: {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
        },
        signDivItem: {
            margin: '20px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'left',
        },
        footer: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            marginTop: '10px',
            marginBottom: '20px',
        },
    };

    return (
        <>
            <div className="container">
                {/* Header with logo */}
                <table className="t-head" style={styles.tableHead}>
                    <tbody>
                        <tr>
                            <td className="logo" style={styles.logo}>
                                <img src="/assets/images/quotation-header.gif" alt="Covai Civil Lap Private Limited" style={styles.logoImage} />
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Quotation Information */}
                <table className="t-head" style={styles.table}>
                    <tbody>
                        <tr>
                            <td style={{ ...styles.tableCell, textAlign: 'center', fontWeight: 'bold', width: '60%' }}>QUOTATION</td>
                            <td style={{ ...styles.tableCell, textAlign: 'right' }}>Date: 13-12-2024</td>
                        </tr>
                        <tr>
                            <td style={{ ...styles.tableCell, paddingTop: '10px', fontWeight: 'bold' }}>
                                {invoiceReport?.customer?.customer_name}
                                <br />
                                {invoiceReport?.customer?.address1}
                            </td>
                            <td style={{ ...styles.tableCell, paddingTop: '10px', textAlign: 'right' }}></td>
                        </tr>
                    </tbody>
                </table>

                {/* Introduction */}
                <div style={{ marginTop: '20px' }}>
                    <p>
                        Dear Sir, <br />
                        <b>Sub: </b>Quotation for Material Testing Services
                        <br />
                        Sending this quote as per our discussion regarding the test at the identified location. Please find the details as below:
                    </p>
                </div>

                {/* Quotation Table */}
                <table className="t-head" style={{ ...styles.table, marginTop: '20px' }}>
                    <thead>
                        <tr>
                            <th style={styles.tableCell}>S. No</th>
                            <th style={styles.tableCell}>WORK DESCRIPTION</th>
                            <th style={styles.tableCell}>UNIT</th>
                            <th style={styles.tableCell}>RATE</th>
                            <th style={styles.tableCell}>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoiceReport?.quotation_items?.map((item: any, index: any) => (
                            <tr key={index}>
                                <td style={styles.tableCell}>{index + 1}</td>
                                <td style={styles.tableCell}>{item.test}</td>
                                <td style={styles.tableCell}>{item.quantity}</td>
                                <td style={styles.tableCell}>{item.price_per_sample}</td>
                                <td style={styles.tableCell}>{item.total}</td>
                            </tr>
                        ))}

                        <tr>
                            <td colSpan={4} style={{ ...styles.tableCell }}>
                                Sub Total
                            </td>
                            <td style={styles.tableCell}>{invoiceReport?.total_amount}</td>
                        </tr>
                        <tr>
                            <td colSpan={4} style={{ ...styles.tableCell }}>
                                {formatTotal() && <p> {formatTotal()}</p>}
                            </td>
                            <td style={styles.tableCell}>{taxAmount}</td>
                        </tr>
                        <tr>
                            <td colSpan={4} style={{ ...styles.tableCell, fontWeight: 'bold' }}>
                                Total
                            </td>
                            <td style={styles.tableCell}>{afterTaxAmount}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Payment Terms */}
                <div style={{ marginTop: '20px' }}>
                    <p style={{ textAlign: 'center', fontSize: '16px' }}>Payment terms:</p>
                    <p>
                        1. 50% of the sub total to be paid along with the Work Order. <br />
                        2. The remaining amount is to be paid immediately upon completion of work. <br />
                        3. Tax Deduction at Source (TDS), if applicable shall be effected when a suitable certificate is issued along with the payment.
                    </p>
                </div>

                {/* Scope of Work */}
                <table style={{ ...styles.table, marginTop: '20px' }}>
                    <tbody>
                        <tr>
                            <td colSpan={2} style={{ ...styles.tableCell, fontWeight: 'bold' }}>
                                SCOPE OF THE WORK
                            </td>
                        </tr>
                        <tr>
                            <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>COVAI CIVIL TECH LAB</td>
                            <td style={{ ...styles.tableCell, fontWeight: 'bold' }}>{invoiceReport?.customer?.customer_name}</td>
                        </tr>
                        <tr>
                            <td style={{ ...styles.tableCell }}>
                                <p>
                                    REBOUND HAMMER <br />
                                    Sample from RC members <br />
                                    Conducting tests on compressive strength for relevant I.S. standards. <br />
                                    Provide a test report within 1 day after the completion of the test at the site.
                                </p>
                            </td>
                            <td style={{ ...styles.tableCell }}>
                                <p>
                                    Provide Work Completion Letter or Certificate while giving test report. <br />
                                    Chipping work will come under your scope.
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* Signatures */}
                <div className="sign-div" style={styles.signDiv}>
                    <div className="sign-div-item" style={styles.signDivItem}>
                        <img src="/assets/images/thirumalai.png" alt="Signature" style={{ width: '150px', height: '80px' }} />
                        <p>
                            Tirumalai Ravikumar <br />
                            Managing Director <br />
                            Covai Civil Lab Private Limited
                        </p>
                    </div>

                    <div className="sign-div-item" style={styles.signDivItem}>
                        <img style={{ width: '200px' }} src={invoiceReport?.quotation_qr} alt="Stamp" />
                    </div>
                </div>

                <hr />

                {/* Footer */}
                <div style={styles.footer}>
                    <img src="/assets/images/quotation-footer.png" alt="Footer" />
                </div>
            </div>
        </>
    );
};

export default QuotationPreview;
