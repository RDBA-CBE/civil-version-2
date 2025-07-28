import moment from 'moment';
import { roundNumber } from './function.util';

export const PAYMENT_MODE_OPTIONS = [
    { value: 'cash', label: 'cash' },
    { value: 'cheque', label: 'cheque' },
    { value: 'upi', label: 'upi ' },
    { value: 'neft', label: 'neft' },
    { value: 'tds', label: 'tds' },
];

export const TAX = [
    {
        id: 1,
        tax_name: 'CGST',
        tax_percentage: '9.00',
    },
    {
        id: 2,
        tax_name: 'SGST',
        tax_percentage: '9.00',
    },
    {
        id: 3,
        tax_name: 'IGST',
        tax_percentage: '9.00',
    },
];

export const scrollConfig: any = {
    x: true,
    y: 330,
};

export const employeeData = (viewRecord: any) => {
    const data = [
        {
            label: 'Employee Name:',
            value: viewRecord?.employee_name || 'N/A',
        },

        {
            label: 'Branch Email:',
            value: viewRecord?.branch_email || 'N/A',
        },
        {
            label: 'Date Of Birth:',
            value: viewRecord?.dob ? moment(viewRecord?.dob).format('DD-MM-YYYY') : 'N/A',
        },
        {
            label: 'Gender:',
            value: viewRecord?.gender || 'N/A',
        },
        {
            label: 'Mobile Number:',
            value: viewRecord?.mobile_number || 'N/A',
        },
        {
            label: 'Qualification:',
            value: viewRecord?.qualification || 'N/A',
        },
        {
            label: 'Salary:',
            value: viewRecord?.salary || 'N/A',
        },
        {
            label: 'Date Of Joining:',
            value: viewRecord?.dob ? moment(viewRecord?.joining_date).format('DD-MM-YYYY') : 'N/A',
        },
        {
            label: 'Address:',
            value: viewRecord?.address || 'N/A',
        },

        {
            label: 'Created Date:',
            value: viewRecord?.dob ? moment(viewRecord?.created_date).format('DD-MM-YYYY') : 'N/A',
        },

        {
            label: 'Modified Date:',
            value: viewRecord?.dob ? moment(viewRecord?.modified_date).format('DD-MM-YYYY') : 'N/A',
        },
    ];

    return data;
};

export const customerData = (viewRecord: any) => {
    const data = [
        {
            label: 'Customer Name:',
            value: viewRecord?.customer_name || 'N/A',
        },

        {
            label: 'Email:',
            value: viewRecord?.email || 'N/A',
        },

        {
            label: 'Mobile Number:',
            value: viewRecord?.phone_no || 'N/A',
        },

        {
            label: 'Address1:',
            value: viewRecord?.address1 || 'N/A',
        },

        {
            label: 'Address2:',
            value: viewRecord?.address2 || 'N/A',
        },
        {
            label: 'Country1:',
            value: viewRecord?.country1?.name || 'N/A',
        },
        {
            label: 'Country2:',
            value: viewRecord?.country2?.name || 'N/A',
        },
        {
            label: 'State1:',
            value: viewRecord?.state1?.name || 'N/A',
        },
        {
            label: 'State2:',
            value: viewRecord?.state2?.name || 'N/A',
        },
        {
            label: 'City1:',
            value: viewRecord?.city1?.name || 'N/A',
        },
        {
            label: 'City2:',
            value: viewRecord?.city2?.name || 'N/A',
        },
        {
            label: 'Pincode1:',
            value: viewRecord?.pincode1 || 'N/A',
        },
        {
            label: 'Pincode2:',
            value: viewRecord?.pincode2 || 'N/A',
        },

        {
            label: 'Created Date:',
            value: viewRecord?.created_date ? moment(viewRecord?.created_date).format('DD-MM-YYYY') : 'N/A',
        },

        {
            label: 'Modified Date:',
            value: viewRecord?.modified_date ? moment(viewRecord?.modified_date).format('DD-MM-YYYY') : 'N/A',
        },
    ];

    return data;
};

export const discountData = (viewRecord: any) => {
    const data = [
        {
            label: 'Customer Name:',
            value: viewRecord?.customer?.customer_name || 'N/A',
        },
        {
            label: 'Discount:',
            value: viewRecord?.discount || 'N/A',
        },

        {
            label: 'Created By:',
            value: viewRecord?.created_by_name || 'N/A',
        },
        {
            label: 'Created Date:',
            value: viewRecord?.created_date ? moment(viewRecord?.created_date).format('DD-MM-YYYY') : 'N/A',
        },

        {
            label: 'Modified Date:',
            value: viewRecord?.modified_date ? moment(viewRecord?.modified_date).format('DD-MM-YYYY') : 'N/A',
        },
    ];

    return data;
};

export const cityData = (viewRecord: any) => {
    const data = [
        {
            label: 'City Name:',
            value: viewRecord?.name || 'N/A',
        },
    ];

    return data;
};

export const invoiceDisData = (viewRecord: any) => {
    const data = [
        {
            label: 'Invoice Number:',
            value: viewRecord?.invoice?.invoice_no || 'N/A',
        },
        {
            label: 'Invoice Date:',
            value: viewRecord?.invoice?.date ? moment(viewRecord?.invoice?.date).format('DD-MM-YYYY') : 'N/A',
        },
        {
            label: 'Customer:',
            value: viewRecord?.invoice?.customer?.customer_name || 'N/A',
        },

        {
            label: 'Customer Address:',
            value: viewRecord?.invoice?.customer?.address1 || 'N/A',
        },
        {
            label: 'Project Name:',
            value: viewRecord?.invoice?.project_name || 'N/A',
        },
        {
            label: 'Last Payment Info:',
            value: viewRecord?.invoice?.invoice_receipt ? viewRecord?.invoice?.invoice_receipt?.payment_mode : 'N/A',
        },
        {
            label: 'Last Payment Amount:',
            value: viewRecord?.invoice?.invoice_receipt ? roundNumber(viewRecord?.invoice?.invoice_receipt?.amount) : 'N/A',
        },

        {
            label: 'Total Amount:',
            value: roundNumber(viewRecord?.invoice?.total_amount) || 'N/A',
        },

        {
            label: 'Invoice Discount:',
            value: viewRecord?.discount > 0 ? `${roundNumber(viewRecord?.discount)}%` : 'N/A',
        },
        {
            label: 'Before Tax:',
            value: roundNumber(viewRecord?.invoice?.before_tax_amount) || 'N/A',
        },
        {
            label: 'Tax:',
            value: viewRecord?.invoice?.tax?.length > 0 ? viewRecord?.invoice?.tax?.map((item: any) => item?.tax_name).join(',') : 'N/A',
        },

        {
            label: 'After Tax:',
            value: roundNumber(viewRecord?.invoice?.after_tax_amount) || 'N/A',
        },

        {
            label: 'Advance',
            value: roundNumber(viewRecord?.invoice?.advance) || 'N/A',
        },
        {
            label: 'Balance',
            value: roundNumber(viewRecord?.invoice?.balance) || 'N/A',
        },
    ];

    return data;
};

export const invoicePaymentData = (viewRecord: any) => {
    const data = [
        {
            label: 'Invoice Number:',
            value: viewRecord?.invoice_no?.invoice_no || 'N/A',
        },
        {
            label: 'Invoice Date:',
            value: viewRecord?.invoice_no?.date ? moment(viewRecord?.invoice_no?.date).format('DD-MM-YYYY') : 'N/A',
        },

        {
            label: 'Project Name:',
            value: viewRecord?.invoice_no?.project_name || 'N/A',
        },
        {
            label: 'Last Payment Info:',
            value: viewRecord?.payment_mode ? viewRecord?.payment_mode : 'N/A',
        },
        {
            label: 'Last Payment Amount:',
            value: viewRecord?.amount ? roundNumber(viewRecord?.amount) : 'N/A',
        },

        {
            label: 'Total Amount:',
            value: roundNumber(viewRecord?.invoice_no?.total_amount) || 'N/A',
        },

        {
            label: 'Before Tax:',
            value: roundNumber(viewRecord?.invoice_no?.before_tax_amount) || 'N/A',
        },

        {
            label: 'After Tax:',
            value: roundNumber(viewRecord?.invoice_no?.after_tax_amount) || 'N/A',
        },

        {
            label: 'Advance',
            value: roundNumber(viewRecord?.invoice_no?.advance) || 'N/A',
        },
        {
            label: 'Balance',
            value: roundNumber(viewRecord?.invoice_no?.balance) || 'N/A',
        },
    ];

    return data;
};

export const testData = (viewRecord: any) => {
    const data = [
        {
            label: 'Test Name:',
            value: viewRecord?.test_name || 'N/A',
        },

        {
            label: 'Material Name:',
            value: viewRecord?.material_name?.material_name || 'N/A',
        },

        {
            label: 'Price:',
            value: viewRecord?.price_per_piece || 'N/A',
        },
        {
            label: 'Created By:',
            value: viewRecord?.created_by || 'N/A',
        },

        {
            label: 'Created Date:',
            value: moment(viewRecord?.created_date).format('DD-MM-YYYY') || 'N/A',
        },
        {
            label: 'Modified Data:',
            value: moment(viewRecord?.modified_date).format('DD-MM-YYYY') || 'N/A',
        },
    ];

    return data;
};

export const expenseCatData = (viewRecord: any) => {
    const data = [
        {
            label: 'Expense Name:',
            value: viewRecord?.expense_name || 'N/A',
        },

        {
            label: 'Created By:',
            value: viewRecord?.created_by || 'N/A',
        },

        {
            label: 'Created Date:',
            value: moment(viewRecord?.created_date).format('DD-MM-YYYY') || 'N/A',
        },
        {
            label: 'Modified Data:',
            value: moment(viewRecord?.modified_date).format('DD-MM-YYYY') || 'N/A',
        },
    ];

    return data;
};

export const invoiceTestData = (viewRecord: any) => {
    const data = [
        {
            label: 'Test Name:',
            value: viewRecord?.test?.test_name || 'N/A',
        },

        {
            label: 'Price Per Sample:',
            value: roundNumber(viewRecord?.price_per_sample) || 'N/A',
        },

        {
            label: 'Quantity:',
            value: roundNumber(viewRecord?.quantity) || 'N/A',
        },

        {
            label: 'Total:',
            value: roundNumber(viewRecord?.total) || 'N/A',
        },

        {
            label: 'Completed:',
            value: viewRecord?.completed || 'N/A',
        },

        // {
        //     label: 'Is Authorised Signatory:',
        //     value: viewRecord?.is_authorised_signatory || 'N/A',
        // },
    ];

    return data;
};

export const quotationData = (viewRecord: any) => {
    const data = [
        {
            label: 'Quotation Number:',
            value: viewRecord?.quotation?.quotation_number || 'N/A',
        },

        {
            label: 'Quotation Item Name:',
            value: viewRecord?.test?.test_name || 'N/A',
        },

        {
            label: 'Price Per Piece:',
            value: roundNumber(viewRecord?.price_per_sample) || 'N/A',
        },

        {
            label: 'Quantity:',
            value: roundNumber(viewRecord?.quantity) || 'N/A',
        },

        {
            label: 'Total:',
            value: roundNumber(roundNumber(viewRecord?.price_per_sample) * roundNumber(viewRecord?.quantity)) || 'N/A',
        },
        {
            label: 'Created By:',
            value: viewRecord?.test?.created_by || 'N/A',
        },

        {
            label: 'Created Date:',
            value: moment(viewRecord?.test?.created_date).format('DD-MM-YYYY') || 'N/A',
        },
        {
            label: 'Modified Data:',
            value: moment(viewRecord?.modified_date).format('DD-MM-YYYY') || 'N/A',
        },
    ];

    return data;
};

export const userData = (viewRecord: any) => {
    const data = [
        {
            label: 'Name:',
            value: viewRecord?.employee_name || 'N/A',
        },

        {
            label: 'Role:',
            value: viewRecord?.roles ? 'Admin' : 'Employee',
        },

        {
            label: 'Email:',
            value:viewRecord?.branch_email || viewRecord?.email || 'N/A',
        },

        {
            label: 'DOB:',
            value: viewRecord?.dob ? moment(viewRecord?.dob)?.format('DD-MM-YYYY') : 'N/A',
        },
        {
            label: 'Address:',
            value: viewRecord?.address || 'N/A',
        },
    ];

    return data;
};
