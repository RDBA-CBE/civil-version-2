import { useState } from 'react';
import { useRouter } from 'next/router';
import BlankLayout from '@/components/Layouts/BlankLayout';
import Link from 'next/link';
import IconLockDots from '@/components/Icon/IconLockDots';
import axios from 'axios';
import { message } from 'antd';
import { baseUrl } from '@/utils/function.util';

const ChangePassword = () => {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showPassword3, setShowPassword3] = useState(false);
    const [passwordMatchError, setPasswordMatchError] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const togglePasswordVisibility2 = () => {
        setShowPassword2((prevShowPassword) => !prevShowPassword);
    };

    const togglePasswordVisibility3 = () => {
        setShowPassword3((prevShowPassword) => !prevShowPassword);
    };

    const [formData, setFormData] = useState({
        old_password: '',
        new_password: '',
        confirm_new_password: '',
    });
    const [messageApi, contextHolder] = message.useMessage();

    const submitForm = async (e: any) => {
        e.preventDefault();
        console.log('formData', formData);

        if (formData.new_password === formData.confirm_new_password) {
            // Passwords match, proceed with your logic here
            console.log('Passwords match!');
        } else {
            // Passwords don't match, display error message
            setPasswordMatchError(true);
        }

        const Token = localStorage.getItem('token');
        axios
            .post(`${baseUrl}/change-password/`, formData, {
                headers: {
                    Authorization: `Token ${Token}`,
                },
            })
            .then((res) => {
                () => router.back();
                messageApi.open({
                    type: 'success',
                    content: 'Password Changed',
                });
            })
            .catch((error: any) => {
                console.log(error.code);
                messageApi.open({
                    type: 'error',
                    content: 'Old password is incorrect',
                });
            });
    };

    const inputChange = (e: any) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setPasswordMatchError(false);
    };

    return (
        <div>
            <div className="absolute inset-0">
                <img src="/assets/images/auth/bg-gradient.png" alt="image" className="h-full w-full object-cover" />
            </div>
            <div className="relative flex min-h-screen items-center justify-center bg-[url(/assets/images/auth/map.png)] bg-cover bg-center bg-no-repeat px-6 py-10 dark:bg-[#060818] sm:px-16">
                <img src="/assets/images/auth/coming-soon-object1.png" alt="image" className="absolute left-0 top-1/2 h-full max-h-[893px] -translate-y-1/2" />
                <img src="/assets/images/auth/coming-soon-object2.png" alt="image" className="absolute left-24 top-0 h-40 md:left-[30%]" />
                <img src="/assets/images/auth/coming-soon-object3.png" alt="image" className="absolute right-0 top-0 h-[300px]" />
                <img src="/assets/images/auth/polygon-object.svg" alt="image" className="absolute bottom-0 end-[28%]" />
                <div className="relative flex w-full max-w-[1502px] flex-col justify-between overflow-hidden rounded-md bg-white/60 backdrop-blur-lg dark:bg-black/50  lg:flex-row lg:gap-10 xl:gap-0">
                    <div className="relative hidden w-full items-center justify-center bg-[linear-gradient(225deg,rgba(239,18,98,1)_0%,rgba(67,97,238,1)_100%)] p-5 lg:inline-flex lg:max-w-[835px] xl:-ms-28 ltr:xl:skew-x-[14deg] rtl:xl:skew-x-[-14deg]">
                        <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent ltr:-right-10 ltr:bg-gradient-to-r rtl:-left-10 rtl:bg-gradient-to-l xl:w-16 ltr:xl:-right-20 rtl:xl:-left-20"></div>
                        <div className="ltr:xl:-skew-x-[14deg] rtl:xl:skew-x-[14deg]">
                            <Link href="/" className="ms-10 block w-48 lg:w-72">
                                <img src="/assets/images/civil-techno-logo-white.png" alt="logo" />
                            </Link>
                            <div className="mt-24 hidden w-full max-w-[430px] lg:block">
                                <img src="/assets/images/auth/change-password.svg" alt="Cover Image" className="w-full" />
                            </div>
                        </div>
                    </div>
                    <div className="relative flex w-full flex-col items-center justify-center gap-6 px-4 pb-16 pt-6 sm:px-6 lg:max-w-[667px]">
                        <div className="flex w-full max-w-[440px] items-center gap-2 lg:absolute lg:end-6 lg:top-6 lg:max-w-full"></div>
                        <div className="w-full max-w-[440px] lg:mt-16">
                            <div className="mb-10">
                                <h1 className="text-brown text-3xl font-extrabold uppercase !leading-snug md:text-4xl">Change Password</h1>
                                <p className="text-base font-bold leading-normal text-white-dark">Enter your Old Password and New password to Change Password</p>
                            </div>
                            {contextHolder}
                            <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
                                <div>
                                    <label htmlFor="Email">Old Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            required
                                            id="old_password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Enter Old Password"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            name="old_password"
                                            value={formData?.old_password}
                                            onChange={inputChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2" onClick={togglePasswordVisibility}>
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Password">New Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            required
                                            id="new_password"
                                            type={showPassword2 ? 'text' : 'password'}
                                            placeholder="Enter New Password"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            name="new_password"
                                            value={formData?.new_password}
                                            onChange={inputChange}
                                        />

                                        <span className="absolute start-4 top-1/2 -translate-y-1/2" onClick={togglePasswordVisibility2} style={{ cursor: 'pointer' }}>
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="Password">Confirm New Password</label>
                                    <div className="relative text-white-dark">
                                        <input
                                            required
                                            id="confirm_new_password"
                                            type={showPassword3 ? 'text' : 'password'}
                                            placeholder="Enter Confirm Password"
                                            className="form-input ps-10 placeholder:text-white-dark"
                                            name="confirm_new_password"
                                            value={formData?.confirm_new_password}
                                            onChange={inputChange}
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2" onClick={togglePasswordVisibility3} style={{ cursor: 'pointer' }}>
                                            <IconLockDots fill={true} />
                                        </span>
                                    </div>
                                    {passwordMatchError && <div style={{ color: 'red', marginTop: '5px' }}>Passwords do not match. Please try again.</div>}
                                </div>
                                <div style={{ display: 'flex' }}>
                                    <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                                        Change Password
                                    </button>
                                    <button
                                        style={{ paddingRight: '10px' }}
                                        type="button"
                                        onClick={() => router.back()}
                                        className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                    >
                                        cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                        <p className="absolute bottom-6 w-full text-center dark:text-white">
                            ©{/* {new Date().getFullYear()} */}
                            2024.Covai Civil Lab Private Limited. All Rights Reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
ChangePassword.getLayout = (page: any) => {
    return <BlankLayout>{page}</BlankLayout>;
};
export default ChangePassword;
