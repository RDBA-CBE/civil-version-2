import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import IconEye from '@/components/Icon/IconEye';
import Link from 'next/link';
import { IRootState } from '../store';
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(
    () => import('react-apexcharts').then(mod => mod.default),
    { ssr: false }
  );
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { baseUrl } from '@/utils/function.util';

const Expense = () => {
    const router = useRouter();
    const [customerCount, setCustomerCount] = useState('');
    const [thisMonthcustomerCount, setthisMonthcustomerCount] = useState('');

    const [invoiceTotal, setInvoiceTotal] = useState('');
    const [incompleteinvoiceTotal, setIncompleteInvoiceTotal] = useState('');


    const [incompletetestTotal, setIncompletetestTotal] = useState('');
    const [incompletetestThisMonthTotal, setincompletetestThisMonthTotal] = useState('');


    const [invoiceThisMonthTotal, setInvoiceThisMonthTotal] = useState('');
    const [incompleteinvoiceThisMonthTotal, setincompleteInvoiceThisMonthTotal] = useState('');
    const [expenseTotal, setExpenseTotal] = useState('');
    const [expenseThisMonthTotal, setExpenseThisMonthTotal] = useState('');
    const [thisMonthName, setthisMonthName] = useState('This');
    const [invoiceMonthData, setInvoiceMonthData] = useState([]);
    const [invoices, setinvoices] = useState([]);
    const [expenses, setexpenses] = useState([]);
    const [expense_amount_sum, setexpense_amount_sum] = useState(0);
    const [admin, setAdmin] = useState<any>([]);
    
    useEffect(() => {
        const Admin: any = localStorage.getItem('admin');
        setAdmin(Admin);
    }, []);

    const [monthName, setMonthName] = useState(['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']);
    const [total, setTotal] = useState([13080.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [paid, setPaid] = useState([1710.0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    const [unpaid, setUnPaid] = useState([18269.7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [initialSeriesData] = [
        {
            name: 'Total',
            data: total,
        },
        {
            name: 'Paid Amount',
            data: paid,
        },
        {
            name: 'Unpaid Amount',
            data: unpaid,
        },
    ];

    const [initialOptions] = [
        {
            chart: {
                height: 325,
                type: 'area',
                fontFamily: 'Nunito, sans-serif',
                zoom: {
                    enabled: false,
                },
                toolbar: {
                    show: false,
                },
            },

            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                curve: 'smooth',
                width: 2,
                lineCap: 'square',
            },
            dropShadow: {
                enabled: true,
                opacity: 0.2,
                blur: 10,
                left: -7,
                top: 22,
            },
            colors: isDark ? ['#2196F3', '#E7515A', '#e670f8'] : ['#1B55E2', '#E7515A', '#e670f8'],
            markers: {
                discrete: [
                    {
                        seriesIndex: 0,
                        dataPointIndex: 6,
                        fillColor: '#1B55E2',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 1,
                        dataPointIndex: 5,
                        fillColor: '#E7515A',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                    {
                        seriesIndex: 2,
                        dataPointIndex: 5,
                        fillColor: '#e670f8',
                        strokeColor: 'transparent',
                        size: 7,
                    },
                ],
            },
            labels: monthName,
            xaxis: {
                axisBorder: {
                    show: false,
                },
                axisTicks: {
                    show: false,
                },
                crosshairs: {
                    show: true,
                },
                labels: {
                    offsetX: isRtl ? 2 : 0,
                    offsetY: 5,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-xaxis-title',
                    },
                },
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: (value: number) => {
                        return value;
                    },
                    offsetX: isRtl ? -30 : -10,
                    offsetY: 0,
                    style: {
                        fontSize: '12px',
                        cssClass: 'apexcharts-yaxis-title',
                    },
                },
                opposite: isRtl ? true : false,
            },
            grid: {
                borderColor: isDark ? '#191E3A' : '#E0E6ED',
                strokeDashArray: 5,
                xaxis: {
                    lines: {
                        show: false,
                    },
                },
                yaxis: {
                    lines: {
                        show: true,
                    },
                },
                padding: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                },
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '16px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5,
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
                x: {
                    show: false,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    inverseColors: !1,
                    opacityFrom: isDark ? 0.19 : 0.28,
                    opacityTo: 0.05,
                    stops: isDark ? [100, 100] : [45, 100],
                },
            },
        },
    ];

    const [payments_sum, setpayments_sum] = useState(0);

    const [revenueChart, setRevenueChart] = useState({
        series: initialSeriesData,
        options: initialOptions,
    });

    const [salesinitdata] = [
        {
            chart: {
                type: 'donut',
                height: 460,
                fontFamily: 'Nunito, sans-serif',
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                show: true,
                width: 25,
                colors: isDark ? '#0e1726' : '#fff',
            },
            colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                markers: {
                    width: 10,
                    height: 10,
                    offsetX: -2,
                },
                height: 50,
                offsetY: 20,
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        background: 'transparent',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '29px',
                                offsetY: -10,
                            },
                            value: {
                                show: true,
                                fontSize: '26px',
                                color: isDark ? '#bfc9d4' : undefined,
                                offsetY: 16,
                                formatter: (val: any) => {
                                    return val;
                                },
                            },
                        },
                    },
                },
            },
            labels: ['Total Amount', 'Paid Amount', 'Unpaid Amount'],
            states: {
                hover: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
                active: {
                    filter: {
                        type: 'none',
                        value: 0.15,
                    },
                },
            },
        },
    ];

    const [salesByCategory, setsalesByCategory] = useState({
        series: [],
        options: salesinitdata,
    });

    const [expenseChart, setExpenseChart] = useState<any>(null);
    const [pending_payment, setpending_payment] = useState('');
    const [pending_payment_this_month, setpending_payment_this_month] = useState('');
    const [expenseMonthWise, setexpenseMonthWise] = useState([]);

    const [categoryinitdata] = [
        {
            chart: {
                height: 360,
                type: 'bar',
                fontFamily: 'Nunito, sans-serif',
                toolbar: {
                    show: false,
                },
            },
            dataLabels: {
                enabled: false,
            },
            stroke: {
                width: 2,
                colors: ['transparent'],
            },
            colors: ['#5c1ac3', '#ffbb44'],
            dropShadow: {
                enabled: true,
                blur: 3,
                color: '#515365',
                opacity: 0.4,
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '55%',
                    borderRadius: 8,
                    borderRadiusApplication: 'end',
                },
            },
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '14px',
                itemMargin: {
                    horizontal: 8,
                    vertical: 8,
                },
            },
            grid: {
                borderColor: isDark ? '#191e3a' : '#e0e6ed',
                padding: {
                    left: 20,
                    right: 20,
                },
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                axisBorder: {
                    show: true,
                    color: isDark ? '#3b3f5c' : '#e0e6ed',
                },
            },
            yaxis: {
                tickAmount: 6,
                opposite: isRtl ? true : false,
                labels: {
                    offsetX: isRtl ? -10 : 0,
                },
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: isDark ? 'dark' : 'light',
                    type: 'vertical',
                    shadeIntensity: 0.3,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 0.8,
                    stops: [0, 100],
                },
            },
            tooltip: {
                marker: {
                    show: true,
                },
            },
        },
    ];

    const [categoryChart, setcategoryChart] = useState<any>({
        series: [],
        options: initialOptions,
    });

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        getExpense();
    }, [payments_sum]);

    useEffect(() => {
        updateChart();
    }, [payments_sum, expenseMonthWise, invoiceMonthData]);

    const getExpense = () => {
        const Token = localStorage.getItem('token');

        axios
            .get(`${baseUrl}/dashboard/`, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                setCustomerCount(res.data.customer_count);
                setthisMonthcustomerCount(res.data.this_month_customer_count);
                setInvoiceTotal(res.data.all_invoice);

                setIncompleteInvoiceTotal(res.data.incompleted_invoice_count )
                setInvoiceThisMonthTotal(res.data.this_month_generated_invoice);

                setIncompletetestTotal(res.data.incompleted_test_count)

                setincompleteInvoiceThisMonthTotal(res.data.this_month_generated_incompleted_invoice)
                setincompletetestThisMonthTotal(res.data.this_month_generated_incompleted_test)
                setExpenseTotal(res.data.total_expense_count);
                setExpenseThisMonthTotal(res.data.this_month_expense_count);
                setpending_payment(res.data.pending_payment);
                setpending_payment_this_month(res.data.pending_payment_this_month);
                setMonthName(res.data.months_name);
                setTotal(res.data.total_amount);
                setPaid(res.data.paid_amount);
                setUnPaid(res.data.banlance_amount);
                setInvoiceMonthData(res.data.payments);
                setthisMonthName(res.data.this_month_name);
                setinvoices(res.data.invoices);
                setexpenses(res.data.expenses);
                setexpenseMonthWise(res.data.expense_amount_list);
                setexpense_amount_sum(res.data.expense_amount_sum);
                setpayments_sum(res.data.payments_sum);

                setsalesByCategory((prevData) => ({
                    series: invoiceMonthData,
                    options: {
                        chart: {
                            type: 'donut',
                            height: 460,
                            fontFamily: 'Nunito, sans-serif',
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        stroke: {
                            show: true,
                            width: 25,
                            colors: isDark ? '#0e1726' : '#fff',
                        },
                        colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                            fontSize: '14px',
                            markers: {
                                width: 10,
                                height: 10,
                                offsetX: -2,
                            },
                            height: 50,
                            offsetY: 20,
                        },
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: '65%',
                                    background: 'transparent',
                                    labels: {
                                        show: true,
                                        name: {
                                            show: true,
                                            fontSize: '29px',
                                            offsetY: -10,
                                        },
                                        value: {
                                            show: true,
                                            fontSize: '26px',
                                            color: isDark ? '#bfc9d4' : undefined,
                                            offsetY: 16,
                                            formatter: (val: any) => {
                                                return val;
                                            },
                                        },
                                        total: {
                                            show: true,
                                            label: 'Total Amount',
                                            color: '#888ea8',
                                            fontSize: '29px',
                                            formatter: (w: any) => {
                                                return res.data.payments_sum;
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        labels: ['Total Amount', 'Paid Amount', 'Unpaid Amount'],
                        states: {
                            hover: {
                                filter: {
                                    type: 'none',
                                    value: 0.15,
                                },
                            },
                            active: {
                                filter: {
                                    type: 'none',
                                    value: 0.15,
                                },
                            },
                        },
                    },
                }));

                setcategoryChart(() => ({
                    series: [
                        {
                            name: 'Amount',
                            data: res.data.expenses_data,
                        },
                    ],

                    options: {
                        chart: {
                            height: 360,
                            type: 'bar',
                            fontFamily: 'Nunito, sans-serif',
                            toolbar: {
                                show: false,
                            },
                        },
                        dataLabels: {
                            enabled: false,
                        },
                        stroke: {
                            width: 2,
                            colors: ['transparent'],
                        },
                        colors: ['#5c1ac3', '#ffbb44'],
                        dropShadow: {
                            enabled: true,
                            blur: 3,
                            color: '#515365',
                            opacity: 0.4,
                        },
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: '55%',
                                borderRadius: 8,
                                borderRadiusApplication: 'end',
                            },
                        },
                        legend: {
                            position: 'bottom',
                            horizontalAlign: 'center',
                            fontSize: '14px',
                            itemMargin: {
                                horizontal: 8,
                                vertical: 8,
                            },
                        },
                        grid: {
                            borderColor: isDark ? '#191e3a' : '#e0e6ed',
                            padding: {
                                left: 20,
                                right: 20,
                            },
                        },
                        xaxis: {
                            categories: res.data.expenses_name,
                            axisBorder: {
                                show: true,
                                color: isDark ? '#3b3f5c' : '#e0e6ed',
                            },
                        },
                        yaxis: {
                            tickAmount: 6,
                            opposite: isRtl ? true : false,
                            labels: {
                                offsetX: isRtl ? -10 : 0,
                            },
                        },
                        fill: {
                            type: 'gradient',
                            gradient: {
                                shade: isDark ? 'dark' : 'light',
                                type: 'vertical',
                                shadeIntensity: 0.3,
                                inverseColors: false,
                                opacityFrom: 1,
                                opacityTo: 0.8,
                                stops: [0, 100],
                            },
                        },
                        tooltip: {
                            marker: {
                                show: true,
                            },
                        },
                    },
                }));
            })
            .catch((error: any) => {
                if (error.response.status === 401) {
                    router.push('/');
                }
            });

        updateChart();
    };

    const updateChart = () => {
        setRevenueChart((prevData: any) => ({
            ...prevData,
            series: [
                {
                    name: 'Total',
                    data: total,
                },
                {
                    name: 'Paid Amount',
                    data: paid,
                },
                {
                    name: 'Unpaid Amount',
                    data: unpaid,
                },
            ],
        }));

        setExpenseChart({
            series: [
                {
                    name: 'Amount',
                    data: expenseMonthWise,
                },
            ],
            options: {
                chart: {
                    height: 325,
                    type: 'area',
                    fontFamily: 'Nunito, sans-serif',
                    zoom: {
                        enabled: false,
                    },
                    toolbar: {
                        show: false,
                    },
                },

                dataLabels: {
                    enabled: false,
                },
                stroke: {
                    show: true,
                    curve: 'smooth',
                    width: 2,
                    lineCap: 'square',
                },
                dropShadow: {
                    enabled: true,
                    opacity: 0.2,
                    blur: 10,
                    left: -7,
                    top: 22,
                },
                colors: isDark ? ['#2196F3', '#E7515A', '#e670f8'] : ['#1B55E2', '#E7515A', '#e670f8'],
                markers: {
                    discrete: [
                        {
                            seriesIndex: 0,
                            dataPointIndex: 6,
                            fillColor: '#1B55E2',
                            strokeColor: 'transparent',
                            size: 7,
                        },
                    ],
                },
                labels: monthName,
                xaxis: {
                    axisBorder: {
                        show: false,
                    },
                    axisTicks: {
                        show: false,
                    },
                    crosshairs: {
                        show: true,
                    },
                    labels: {
                        offsetX: isRtl ? 2 : 0,
                        offsetY: 5,
                        style: {
                            fontSize: '12px',
                            cssClass: 'apexcharts-xaxis-title',
                        },
                    },
                },
                yaxis: {
                    tickAmount: 7,
                    labels: {
                        formatter: (value: number) => {
                            return value;
                        },
                        offsetX: isRtl ? -30 : -10,
                        offsetY: 0,
                        style: {
                            fontSize: '12px',
                            cssClass: 'apexcharts-yaxis-title',
                        },
                    },
                    opposite: isRtl ? true : false,
                },
                grid: {
                    borderColor: isDark ? '#191E3A' : '#E0E6ED',
                    strokeDashArray: 5,
                    xaxis: {
                        lines: {
                            show: false,
                        },
                    },
                    yaxis: {
                        lines: {
                            show: true,
                        },
                    },
                    padding: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    fontSize: '16px',
                    markers: {
                        width: 10,
                        height: 10,
                        offsetX: -2,
                    },
                    itemMargin: {
                        horizontal: 10,
                        vertical: 5,
                    },
                },
                tooltip: {
                    marker: {
                        show: true,
                    },
                    x: {
                        show: false,
                    },
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        inverseColors: !1,
                        opacityFrom: isDark ? 0.19 : 0.28,
                        opacityTo: 0.05,
                        stops: isDark ? [100, 100] : [45, 100],
                    },
                },
            },
        });
    };

    return (
        <>
            <div>
                <ul className="flex space-x-2 font-bold rtl:space-x-reverse">
                    <li>
                        <span className="text-lg">Dashboard</span>
                    </li>
                </ul>
                <div className="pt-5">
                    <div className="mb-6 grid grid-cols-1 gap-6 text-white sm:grid-cols-2 xl:grid-cols-4">
                        {admin === 'true' ? (
                            <>
                                <Link href="/people/customer">
                                    <div className="panel bg-gradient-to-r from-cyan-500 to-cyan-400">
                                        <div className="flex justify-between">
                                            <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Customer</div>
                                        </div>
                                        <div className="mt-5 flex items-center">
                                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">Total : {customerCount} </div>
                                        </div>
                                        <div className="mt-5 flex items-center font-semibold">
                                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                            {thisMonthName} month added : {thisMonthcustomerCount}
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/invoice/invoice">
                                    <div className="panel bg-gradient-to-r from-violet-500 to-violet-400">
                                        <div className="flex justify-between">
                                            <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Invoices</div>
                                            <div className="dropdown"></div>
                                        </div>
                                        <div className="mt-5 flex items-center">
                                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">Total : {invoiceTotal} </div>
                                        </div>
                                        <div className="mt-5 flex items-center font-semibold">
                                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                            {thisMonthName} Month Created : {invoiceThisMonthTotal}
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/invoice/invoice">
                                    <div className="panel bg-gradient-to-r from-red-500 to-red-400">
                                        <div className="flex justify-between">
                                            <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Incomplete Invoices</div>
                                            <div className="dropdown"></div>
                                        </div>
                                        <div className="mt-5 flex items-center">
                                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">Total : {incompleteinvoiceTotal} </div>
                                        </div>
                                        <div className="mt-5 flex items-center font-semibold">
                                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                            {thisMonthName} Month Created : {incompleteinvoiceThisMonthTotal}
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/report/testReport">
           
                                <div className="panel bg-gradient-to-r from-rose-500 to-rose-400">
                                    <div className="flex justify-between">
                                        <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Incomplete Tests</div>
                                        <div className="dropdown"></div>
                                    </div>
                                    <div className="mt-5 flex items-center">
                                        <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">Total : {incompletetestTotal} </div>
                                    </div>
                                    <div className="mt-5 flex items-center font-semibold">
                                        <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                        {thisMonthName} Month Created : {incompletetestThisMonthTotal}
                                    </div>
                                </div>   

                                </Link>                         

                                <Link href="/report/expenseReport">
                                    <div className="panel bg-gradient-to-r from-blue-500 to-blue-400">
                                        <div className="flex justify-between">
                                            <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Expense</div>
                                        </div>
                                        <div className="mt-5 flex items-center">
                                            <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3"> Total : {expenseTotal} </div>
                                        </div>
                                        <div className="mt-5 flex items-center font-semibold">
                                            <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                            {thisMonthName} Month added : {expenseThisMonthTotal}
                                        </div>
                                    </div>
                                </Link>
                            </>
                        ) : (
                            <></>
                        )}

                        <Link href="/invoice/pendingPayment">
                            <div className="panel bg-gradient-to-r from-fuchsia-500 to-fuchsia-400">
                                <div className="flex justify-between">
                                    <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">Pending Payment</div>
                                    <div className="dropdown"></div>
                                </div>
                                <div className="mt-5 flex items-center">
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">Amount : {pending_payment} </div>
                                </div>
                                <div className="mt-5 flex items-center font-semibold">
                                    <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                    {thisMonthName} Month : {pending_payment_this_month}
                                </div>
                            </div>
                        </Link>

                        



                    </div>

                    {admin === 'true' ? (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="panel h-full">
                                    <div className="mb-5 flex items-center font-bold">
                                        <span className="text-lg">Payment</span>
                                    </div>
                                    <div className=" h-full xl:col-span-2">
                                        <div className="relative">
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {isMounted ? (
                                                    <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width={'100%'} />
                                                ) : (
                                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="panel h-full">
                                        <div className="mb-5 flex items-center">
                                            <h5 className="text-lg font-semibold dark:text-white-light">{thisMonthName} Payment</h5>
                                        </div>
                                        <div>
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {isMounted ? (
                                                    <ReactApexChart series={salesByCategory.series} options={salesByCategory.options} type="donut" height={460} width={'100%'} />
                                                ) : (
                                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}

                    <div className="mb-6 grid grid-cols-1 gap-12">
                        <div className="panel h-full w-full">
                            <div className="mb-5 flex items-center justify-between">
                                <h5 className="text-lg font-semibold dark:text-white-light">Recent Invoices</h5>
                            </div>
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th className="ltr:rounded-l-md rtl:rounded-r-md">Customer</th>
                                            <th>Invoice No</th>
                                            <th>Amount</th>
                                            <th>Balance</th>
                                            <th className="ltr:rounded-r-md rtl:rounded-l-md">Project Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((item: any, rowIndex: any) => (
                                            <tr key={rowIndex} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                                <td>{item.customer}</td>
                                                <td>{item.invoice_no}</td>
                                                <td>{item.total_amount}</td>
                                                <td>{item.balance}</td>
                                                <td>{item.project_name}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {admin === 'true' ? (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="panel h-full ">
                                    <div className="mb-5 flex items-center font-bold">
                                        <span className="text-lg">Expense - ({expense_amount_sum})</span>
                                    </div>
                                    <div className="xl:col-span-2">
                                        <div className="relative">
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {isMounted ? (
                                                    <ReactApexChart series={expenseChart.series} options={expenseChart.options} type="area" height={325} width={'100%'} />
                                                ) : (
                                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="panel h-full">
                                        <div className="mb-5 flex items-center">
                                            <h5 className="text-lg font-semibold dark:text-white-light">{thisMonthName} Expense</h5>
                                        </div>
                                        <div>
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {isMounted ? (
                                                    <ReactApexChart options={categoryChart.options} series={categoryChart.series} type="bar" height={360} width={'100%'} />
                                                ) : (
                                                    <div className="grid min-h-[325px] place-content-center bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] ">
                                                        <span className="inline-flex h-5 w-5 animate-spin rounded-full  border-2 border-black !border-l-transparent dark:border-white"></span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6 grid grid-cols-1 gap-12">
                                <div className="panel h-full w-full">
                                    <div className="mb-5 flex items-center justify-between">
                                        <h5 className="text-lg font-semibold dark:text-white-light">Recent Expenses</h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th className="ltr:rounded-l-md rtl:rounded-r-md">Expense User</th>
                                                    <th>Date</th>
                                                    <th>Category</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {expenses.map((item: any, rowIndex) => (
                                                    <tr key={rowIndex} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                                        <td>{item.expense_user}</td>
                                                        <td>{dayjs(item.date).format('MMMM DD, YYYY')}</td>
                                                        <td>{item.expense_category_name}</td>

                                                        <td>{item.amount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </>
    );
};

export default Expense;
