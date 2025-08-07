import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Modal } from 'antd';
import Models from '@/imports/models.import';

const Sidebar = () => {
    const router = useRouter();

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const [admin, setAdmin] = useState('');

    useEffect(() => {
        const Admin: any = localStorage.getItem('admin');
        setAdmin(Admin);
    }, []);

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [router.pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    const dispatch = useDispatch();
    const { t } = useTranslation();

    const { confirm } = Modal;

    const showConfirm = () => {
           confirm({
               title: 'Logout',
               content: 'Do you Want to Logout ?',
               onOk() {
                   const Token = localStorage.getItem('token');
   
                   if (!Token) {
                   } else {
                       logout();
                   }
               },
               onCancel() {},
           });
       };
   
       const logout = async () => {
           try {
               const res = await Models.auth.logout();
               localStorage.clear();
               router.push('/');
           } catch (error) {
               console.log('✌️error --->', error);
           }
       };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar small-device fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${
                    semidark ? 'text-white-dark' : ''
                }`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/civil-techno-logo.png" alt="logo" style={{ width: '50%' }} />
                        </Link>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>{t('Dashboard')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <Link href="/dashboard" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Dashboard')}</span>
                                    </div>
                                </Link>
                            </li>

                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>{t('PEOPLE')}</span>
                            </h2>

                            <li className="nav-item">
                                <ul>
                                    <li className="nav-item">
                                        <Link href="/people/customer" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Customer')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link href="/people/employee" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Employee')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    {/* <li className="nav-item">
                                        <Link href="/people/manager" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">{t('Manager')}</span>
                                            </div>
                                        </Link>
                                    </li> */}
                                </ul>
                            </li>

                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>{t('Master')}</span>
                            </h2>
                            <li className="menu nav-item">
                                <Link href="/master/discount" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Discount')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item">
                                <Link href="/master/tax" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Tax')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/master/material" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Material')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/master/test" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Test')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/master/expense" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Expense Category')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/master/city" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('City')}</span>
                                    </div>
                                </Link>
                            </li>

                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>{t('invoice')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <Link href="/invoice/invoice" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Invoice')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/invoice/qoutation" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Quotation')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/invoice/pendingPayment" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Pending Payment')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/invoice/expenseEntry" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Expense Entry')}</span>
                                    </div>
                                </Link>
                            </li>

                            <li className="menu nav-item">
                                <Link href="/invoice/invoiceFileUplod" className="group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('File Upload')}</span>
                                    </div>
                                </Link>
                            </li>

                            {admin === 'true' ? (
                                <>
                                    <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                        <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                        <span>{t('Report')}</span>
                                    </h2>

                                    <li className="menu nav-item">
                                        <Link href="/report/saleReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Sales Report')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <Link href="/report/expenseReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Expense Report')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <Link href="/report/expenseFileReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Expense File Report')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="menu nav-item">
                                        <Link href="/report/invoiceFileReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Invoice File Report')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <Link href="/report/testReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Test Report')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="menu nav-item">
                                        <Link href="/report/pendingPaymentReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Pending Payment Report')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="menu nav-item">
                                        <Link href="/report/invoiceReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Invoice Report')}</span>
                                            </div>
                                        </Link>
                                    </li>

                                    <li className="menu nav-item">
                                        <Link href="/report/quotationReport" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Quotation Report')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <></>
                            )}

                            {admin === 'true' && (
                                <>
                                    <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                        <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                        </svg>
                                        <span>{t('Logs')}</span>
                                    </h2>

                                    <li className="menu nav-item">
                                        <Link href="/logs/logs" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Logs')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                    <li className="menu nav-item">
                                        <Link href="/logs/software_log" className="group">
                                            <div className="flex items-center">
                                                <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Software Logs')}</span>
                                            </div>
                                        </Link>
                                    </li>
                                </>
                            )}

                            <h2 className="-mx-4 mb-1 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <svg className="hidden h-5 w-4 flex-none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                </svg>
                                <span>{t('users')}</span>
                            </h2>

                            <li className="menu nav-item">
                                <Link href="/auth/changePassword" className="nav-link group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Change Password')}</span>
                                    </div>
                                </Link>
                            </li>
                            <li className="menu nav-item" onClick={() => showConfirm()}>
                                <Link href="#" className="nav-link group">
                                    <div className="flex items-center">
                                        <span className="text-black dark:text-[#506690] dark:group-hover:text-white-dark ltr:pl-3 rtl:pr-3">{t('Logout')}</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
