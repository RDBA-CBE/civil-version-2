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
