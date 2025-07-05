import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import {
    User,
    Lock,
    Eye,
    EyeOff,
    Shield,
    LogIn,
    Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { login } from '../../features/store/authSlice';

const validationSchema = Yup.object().shape({
    username: Yup.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username cannot exceed 50 characters')
        .required('Username is required'),
    password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

interface FormValues {
    username: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: {
        id: string;
        username: string;
        email: string;
        role: string;
    };
}

const Login: React.FC = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{
        type: 'success' | 'error';
        message: string
    } | null>(null);

    const initialValues: FormValues = {
        username: '',
        password: ''
    };

    const handleSubmit = async (values: FormValues, { setFieldError }: any) => {
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const payload = {
                username: values.username,
                password: values.password,
            };

            const response = await axios.post(
                `${(import.meta as any).env.VITE_LKM_BASE_URL}/fastapi/auth/login`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const { data } = response;
            if (data?.message) {
                toast.success(data.message);
                // // Redirect after success
                dispatch(login({ Role: data.USER_ROLE }));
                navigate('/');
            }

        } catch (error: any) {
            console.error('Login error:', error);

            if (error.response) {
                const status = error.response.status;
                const errorMessage =
                    error.response.data?.message ||
                    error.response.data?.detail ||
                    'Invalid credentials. Please check your username and password.';

                if (status === 401 || status === 402) {
                    toast.error(errorMessage);
                }



            }
        } finally {
            setIsSubmitting(false);
        }
    };







    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center  px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    {/* <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full mb-6 shadow-lg">
                        <Shield className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 font-playfair mb-2">
                        Welcome Back
                    </h1> */}
                    <p className="text-3xl font-bold text-gray-900 font-playfair mb-2">
                        Sign in
                    </p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    {/* {submitMessage && (
                        <div className={`message ${submitMessage.type === 'success' ? 'message-success' : 'message-error'} fade-in mb-6`}>
                            <div className="flex items-center">
                                {submitMessage.type === 'success' ? (
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 mr-2" />
                                )}
                                {submitMessage.message}
                            </div>
                        </div>
                    )} */}

                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ errors, touched }) => (
                            <Form className="space-y-6">
                                {/* Username Field */}
                                <div className="fade-in">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <User className="w-4 h-4 mr-2 text-teal-600" />
                                        Username
                                    </label>
                                    <Field
                                        name="username"
                                        className={`input-box ${errors.username && touched.username ? 'error' : ''}`}
                                        placeholder="Enter your username"
                                        autoComplete="username"
                                    />
                                    <ErrorMessage name="username" component="div" className="text-red-500 text-xs mt-1" />
                                </div>

                                {/* Password Field */}
                                <div className="fade-in">
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-teal-600" />
                                        Password
                                    </label>
                                    <div className="relative">
                                        <Field
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            className={`input-box pr-12 ${errors.password && touched.password ? 'error' : ''}`}
                                            placeholder="Enter your password"
                                            autoComplete="current-password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="w-5 h-5" />
                                            ) : (
                                                <Eye className="w-5 h-5" />
                                            )}
                                        </button>
                                    </div>
                                    <ErrorMessage name="password" component="div" className="text-red-500 text-xs mt-1" />
                                </div>

                                {/* Remember Me & Forgot Password */}
                                <div className="flex items-center justify-between fade-in">
                                    <div className="flex items-center">
                                        <input
                                            id="remember-me"
                                            name="remember-me"
                                            type="checkbox"
                                            className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="text-sm">
                                        <Link
                                            to="/forgot-password"
                                            className="font-medium text-teal-600 hover:text-teal-500 transition-colors"

                                        >
                                            Forgot password?
                                        </Link>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="fade-in">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full btn_base btn-primary py-3 text-base font-medium"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="spinner mr-2"></div>
                                                Signing in...
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="w-5 h-5 mr-2" />
                                                Sign In
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Additional Links */}
                                <div className="text-center fade-in">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <Link
                                            to="/sign-up"
                                            className="font-medium text-teal-600 hover:text-teal-500 transition-colors"


                                        >
                                            Sign Up
                                        </Link>
                                    </p>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>

                {/* Footer */}

            </div>
        </div>
    );
};

export default Login;