import { useState } from 'react';
import { useRouter } from 'next/router';
import BlankLayout from '@/components/Layouts/BlankLayout';
import Link from 'next/link';
import IconLockDots from '@/components/Icon/IconLockDots';
import { Form, Input, Button, message } from 'antd';
import Models from '@/imports/models.import';

const ChangePassword = () => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showPassword3, setShowPassword3] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const togglePasswordVisibility2 = () => {
        setShowPassword2((prev) => !prev);
    };

    const togglePasswordVisibility3 = () => {
        setShowPassword3((prev) => !prev);
    };

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const res = await Models.auth.changePassword(values);
            message.success('Password changed successfully!');
            router.back();
            setLoading(false);
        } catch (error: any) {
            if (error?.detail) {
                message.error(error.detail);
            }
            console.log('✌️error --->', error);
            setLoading(false);
        }
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
                        <div className="absolute inset-y-0 w-8 from-primary/10 via-transparent to-transparent xl:w-16 ltr:-right-10 ltr:bg-gradient-to-r ltr:xl:-right-20 rtl:-left-10 rtl:bg-gradient-to-l rtl:xl:-left-20"></div>
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
                            <Form form={form} name="change-password" onFinish={onFinish} layout="vertical" requiredMark={false}>
                                <Form.Item name="old_password" label="Old Password" rules={[{ required: true, message: 'Please input your old password!' }]}>
                                    <Input.Password
                                        placeholder="Enter Old Password"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                        iconRender={(visible) => (
                                            <span onClick={togglePasswordVisibility} style={{ cursor: 'pointer' }}>
                                                <IconLockDots fill={true} />
                                            </span>
                                        )}
                                        visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="new_password"
                                    label="New Password"
                                    rules={[
                                        { required: true, message: 'Please input your new password!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('old_password') !== value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('New password must be different from old password!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        placeholder="Enter New Password"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                        iconRender={(visible) => (
                                            <span onClick={togglePasswordVisibility2} style={{ cursor: 'pointer' }}>
                                                <IconLockDots fill={true} />
                                            </span>
                                        )}
                                        visibilityToggle={{ visible: showPassword2, onVisibleChange: setShowPassword2 }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    name="confirm_new_password"
                                    label="Confirm New Password"
                                    dependencies={['new_password']}
                                    rules={[
                                        { required: true, message: 'Please confirm your new password!' },
                                        ({ getFieldValue }) => ({
                                            validator(_, value) {
                                                if (!value || getFieldValue('new_password') === value) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('The two passwords do not match!'));
                                            },
                                        }),
                                    ]}
                                >
                                    <Input.Password
                                        placeholder="Confirm New Password"
                                        className="form-input ps-10 placeholder:text-white-dark"
                                        iconRender={(visible) => (
                                            <span onClick={togglePasswordVisibility3} style={{ cursor: 'pointer' }}>
                                                <IconLockDots fill={true} />
                                            </span>
                                        )}
                                        visibilityToggle={{ visible: showPassword3, onVisibleChange: setShowPassword3 }}
                                    />
                                </Form.Item>

                                <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                                    <Form.Item style={{ width: '50%' }}>
                                        <Button
                                            type="default"
                                            htmlType="submit"
                                            loading={loading}
                                            className="btn btn-gradient !mt-4 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                width: '100%',
                                            }}
                                        >
                                            Change Password
                                        </Button>
                                    </Form.Item>
                                    <Form.Item style={{ width: '50%' }}>
                                        <Button
                                            type="default"
                                            onClick={() => router.back()}
                                            className="btn btn-gradient !mt-4 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                width: '100%',
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </Form.Item>
                                </div>
                            </Form>
                        </div>
                        <p className="absolute bottom-6 w-full text-center dark:text-white">©2024.Covai Civil Lab Private Limited. All Rights Reserved.</p>
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
