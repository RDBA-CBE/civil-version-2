import auth from "@/models/auth.model";
import city from "@/models/city.model";
import customer from "@/models/customer.model";
import discount from "@/models/discount.model";
import expense from "@/models/expense.model";
import expenseEntry from "@/models/expenseEntry.model";
import invoice from "@/models/invoice.model";
import invoiceFile from "@/models/invoiceFile.model";
import logs from "@/models/log.model";
import material from "@/models/material.model";
import paymentPending from "@/models/paymentPending.model";
import qoutation from "@/models/qoutation.model";
import test from "@/models/test.model";





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
    expenseEntry,
    invoiceFile
   

};

export default Models;
