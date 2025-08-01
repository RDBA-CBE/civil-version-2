import auth from '@/models/auth.model';
import city from '@/models/city.model';
import customer from '@/models/customer.model';
import discount from '@/models/discount.model';
import expense from '@/models/expense.model';
import expenseEntry from '@/models/expenseEntry.model';
import invoice from '@/models/invoice.model';
import invoiceFile from '@/models/invoiceFile.model';
import invoiceReport from '@/models/invoiceReport.model';
import logs from '@/models/log.model';
import material from '@/models/material.model';
import paymentPending from '@/models/paymentPending.model';
import qoutation from '@/models/qoutation.model';
import quotationReport from '@/models/quotationReport.model ';
import test from '@/models/test.model';
import preview from '@/models/preview.nodel';
import testReport from '@/models/testReport.model';
import state from '@/models/state.mode';
import tax from '@/models/tax.model';

export const Models = {
    auth,
    logs,
    invoice,
    discount,
    customer,
    material,
    test,
    city,
    expense,
    qoutation,
    paymentPending,
    preview,
    expenseEntry,
    invoiceFile,
    invoiceReport,
    quotationReport,
    testReport,
    state,
    tax,
};

export default Models;
