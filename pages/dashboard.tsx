import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import IconEye from '@/components/Icon/IconEye';
import Link from 'next/link';
import { IRootState } from '../store';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import dayjs from 'dayjs';
import { baseUrl, roundNumber, useSetState } from '@/utils/function.util';
import Models from '@/imports/models.import';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
});
import { ApexOptions } from 'apexcharts';

const Expense = () => {
    const [state, setState] = useSetState({
        data: null,
        cardData: [],
        invoiceList: [],
        currentMonth: 'This',
        expenseList: [],
        expenceTotal: 0,
        admin: 'false',
        isMounted: false,
        monthPaymentChart: {},
        monthBarChart: {},
        expenseChart: {},
        monthExpenseChart: {},
    });



    const [monthName, setMonthName] = useState(['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March']);


    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    useEffect(() => {
        const admin: any = localStorage.getItem('admin');
        if (admin) {
            setState({ admin });
        }
    }, []);

    useEffect(() => {
        setState({ isMounted: true });
        getExpense();
    }, []);

    const getExpense = async () => {
        try {
            const res: any = await Models.auth.dashboard();
            console.log('✌️res --->', res);

            const cardData = [
                {
                    name: 'Customer',
                    total: res?.customer_count,
                    monthData: res?.this_month_customer_count,
                    bg: 'from-cyan-500 to-cyan-400',
                    link: '/people/customer',
                },
                {
                    name: 'Invoices',
                    total: res?.all_invoice,
                    monthData: res?.this_month_generated_invoice,
                    bg: 'from-violet-500 to-violet-400',
                    link: '/invoice/invoice',
                },
                {
                    name: 'Incomplete Invoices',
                    total: res?.incompleted_invoice_count,
                    monthData: res?.this_month_generated_incompleted_invoice,
                    bg: 'from-red-500 to-red-400',
                    link: '/invoice/invoice',
                },
                {
                    name: 'Incomplete tests',
                    total: res?.incompleted_test_count,
                    monthData: res?.this_month_generated_incompleted_test,
                    bg: 'from-rose-500 to-rose-400',
                    link: '/report/testReport',
                },
                {
                    name: 'Expense',
                    total: res?.total_expense_count,
                    monthData: res?.this_month_expense_entry_count,
                    bg: 'from-blue-500 to-blue-400',
                    link: '/report/expenseReport',
                },
            ];

            const revenueOptions = [
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
                    labels: ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'],
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

            const revenueSeries = [
                {
                    name: 'Total',
                    data: res?.total_amount,
                },
                {
                    name: 'Paid Amount',
                    data: res?.paid_amount,
                },
                {
                    name: 'Unpaid Amount',
                    data: res?.banlance_amount,
                },
            ];

            const paymentCharts: ApexOptions = {
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
                },
                colors: isDark ? ['#5c1ac3', '#e2a03f', '#e7515a', '#e2a03f'] : ['#e2a03f', '#5c1ac3', '#e7515a'],
                legend: {
                    position: 'bottom',
                    horizontalAlign: 'center',
                    fontSize: '14px',
                    markers: {
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
                                        return res.payments_sum;
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
                        },
                    },
                    active: {
                        filter: {
                            type: 'none',
                        },
                    },
                },
            };

            const expenseSeries = [
                {
                    name: 'Amount',
                    data: res.expense_amount_list,
                },
            ];

            const expenseOptions = {
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
            };

            const monthExpenseSeries = [
                {
                    name: 'Amount',
                    data: res.expenses_data,
                },
            ];
            const monthExpenseOptions = {
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
                    categories: res.expenses_name,
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
            };

            const pendingPayment = {
                total: roundNumber(res?.pending_payment),
                monthData: roundNumber(res?.pending_payment_this_month),
            };

            const monthPaymentChart = {
                series: res.payments,
                options: paymentCharts,
            };

            const monthBarChart = {
                series: revenueSeries,
                options: revenueOptions[0],
            };

            const expenseChart = {
                series: expenseSeries,
                options: expenseOptions,
            };

            const monthExpenseChart = {
                series: monthExpenseSeries,
                options: monthExpenseOptions,
            };

            setState({
                cardData,
                pendingPayment,
                currentMonth: res?.this_month_name,
                invoiceList: res?.invoices,
                expenseList: res?.expenses,
                expenceTotal: res?.expense_amount_sum,
                monthPaymentChart,
                monthBarChart,
                expenseChart,
                monthExpenseChart,
            });
        } catch (error) {
            console.log('✌️error --->', error);
        }

       

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
                        {state.admin === 'true' ? (
                            <>
                                {state.cardData?.map((item: any) => (
                                    <Link href={item?.link ? item?.link : '#'}>
                                        <div className={`panel bg-gradient-to-r ${item?.bg} `}>
                                            <div className="flex justify-between">
                                                <div className="text-md font-semibold ltr:mr-1 rtl:ml-1">{item?.name}</div>
                                            </div>
                                            <div className="mt-5 flex items-center">
                                                <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">Total : {item?.total} </div>
                                            </div>
                                            <div className="mt-5 flex items-center font-semibold">
                                                <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                                {state.currentMonth} month added : {item?.monthData}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
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
                                    <div className="text-3xl font-bold ltr:mr-3 rtl:ml-3">Amount : {state.pendingPayment?.total} </div>
                                </div>
                                <div className="mt-5 flex items-center font-semibold">
                                    <IconEye className="shrink-0 ltr:mr-2 rtl:ml-2" />
                                    {state.currentMonth} Month : {state.pendingPayment?.monthData}
                                </div>
                            </div>
                        </Link>
                    </div>

                    {state.admin === 'true' ? (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="panel h-full">
                                    <div className="mb-5 flex items-center font-bold">
                                        <span className="text-lg">Payment</span>
                                    </div>
                                    <div className=" h-full xl:col-span-2">
                                        <div className="relative">
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {state.isMounted && state.monthBarChart.series?.length > 0 ? (
                                                    <ReactApexChart series={state.monthBarChart?.series || []} options={state.monthBarChart?.options || []} type="area" height={325} width={'100%'} />
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
                                            <h5 className="text-lg font-semibold dark:text-white-light">{state.currentMonth} Payment</h5>
                                        </div>
                                        <div>
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {state.isMounted && state.monthPaymentChart.series?.length > 0 ? (
                                                    // <ReactApexChart series={revenueChart.series} options={revenueChart.options} type="area" height={325} width={'100%'} />

                                                    <ReactApexChart
                                                        key={state.isMounted ? 'mounted' : 'unmounted'}
                                                        series={state.monthPaymentChart?.series || []}
                                                        options={state.monthPaymentChart?.options || []}
                                                        type="donut"
                                                        height={460}
                                                        width={'100%'}
                                                    />
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
                            {state.invoiceList?.length > 0 ? (
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
                                            {state.invoiceList?.map((item: any, rowIndex: any) => (
                                                <tr key={rowIndex} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                                    <td>{item?.customer}</td>
                                                    <td>{item?.invoice_no}</td>
                                                    <td>{roundNumber(item?.total_amount)}</td>
                                                    <td>{roundNumber(item?.balance)}</td>
                                                    <td>{item?.project_name}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div>No Invoice Found</div>
                            )}
                        </div>
                    </div>

                    {state.admin === 'true' ? (
                        <>
                            <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="panel h-full ">
                                    <div className="mb-5 flex items-center font-bold">
                                        <span className="text-lg">Expense - ({state.expenceTotal})</span>
                                    </div>
                                    <div className="xl:col-span-2">
                                        <div className="relative">
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {state.isMounted && state.expenseChart?.series?.length > 0 ? (
                                                    <ReactApexChart series={state.expenseChart?.series || []} options={state.expenseChart?.options || []} type="area" height={325} width={'100%'} />
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
                                            <h5 className="text-lg font-semibold dark:text-white-light">{state.currentMonth} Expense</h5>
                                        </div>
                                        <div>
                                            <div className="rounded-lg bg-white dark:bg-black">
                                                {state.isMounted && state.monthExpenseChart?.series?.length > 0 ? (
                                                    <ReactApexChart options={state.monthExpenseChart?.options} series={state.monthExpenseChart?.series || []} type="bar" height={360} width={'100%'} />
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
                                    {state.expenseList?.length > 0 ? (
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
                                                    {state.expenseList?.map((item: any, rowIndex: number) => (
                                                        <tr key={rowIndex} className="group text-white-dark hover:text-black dark:hover:text-white-light/90">
                                                            <td>{item?.expense_user}</td>
                                                            <td>{dayjs(item?.date).format('MMMM DD, YYYY')}</td>
                                                            <td>{item?.expense_category_name}</td>

                                                            <td>{roundNumber(item?.amount)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div>No Expense Found</div>
                                    )}
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
