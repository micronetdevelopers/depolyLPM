import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSendOtpMutation, useVerifyOtpMutation, useResetPasswordMutation } from '../../features/services/apiSlice';
import toast from 'react-hot-toast';

const ForgotPasswprd = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [resendTimer, setResendTimer] = useState(60);
    const [verifyLoading, setVerifyLoading] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const otpInputs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();

    // API hooks
    const [sendOtp, { isLoading: sendOtpLoading }] = useSendOtpMutation();
    const [verifyOtp, { isLoading: verifyOtpLoading }] = useVerifyOtpMutation();
    const [resetPassword, { isLoading: resetPasswordLoading }] = useResetPasswordMutation();

    useEffect(() => {
        let timer;
        if (isSubmitted && resendTimer > 0) {
            timer = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isSubmitted, resendTimer]);

    // Step 1: Submit email to get OTP
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        try {
            const result = await sendOtp({ email }).unwrap();
            setIsSubmitted(true);
            setResendTimer(60);
            toast.success('OTP sent successfully! Please check your email.');
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to send OTP. Please try again.');
        }
    };

    // Step 2: Handle OTP input
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < otp.length - 1) {
            otpInputs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            const newOtp = [...otp];
            newOtp[index - 1] = "";
            setOtp(newOtp);
            otpInputs.current[index - 1]?.focus();
        }
    };

    // Step 3: Verify OTP
    const handleVerifyOtp = async () => {
        setVerifyLoading(true);
        const enteredOtp = otp.join('');
        if (enteredOtp.length !== 6) {
            toast.error('Please enter the 6-digit OTP');
            setVerifyLoading(false);
            return;
        }

        try {
            const result = await verifyOtp({ email, otp: enteredOtp }).unwrap();
            setOtpVerified(true);
            toast.success('OTP verified successfully!');
        } catch (err) {
            toast.error(err?.data?.detail || 'Invalid OTP. Please try again.');
        } finally {
            setVerifyLoading(false);
        }
    };

    // Step 4: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) {
            toast.error('Please fill in all password fields');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            const result = await resetPassword({ 
                email, 
                new_password: newPassword, 
                confirm_password: confirmPassword 
            }).unwrap();
            setResetSuccess(true);
            toast.success('Password reset successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err?.data?.detail || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f3f7fa] to-[#e6f0f6]">
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Forgot Password</h1>
                {!isSubmitted && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-700 mb-1 font-medium">Email</label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#009688] text-gray-800"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={sendOtpLoading}
                            className={`w-full py-2 rounded-lg font-semibold transition ${sendOtpLoading ? "bg-gray-400" : "bg-[#009688] hover:bg-[#00796b] text-white"}`}
                        >
                            {sendOtpLoading ? "Sending..." : "Send OTP"}
                        </button>
                    </form>
                )}

                {isSubmitted && !otpVerified && (
                    <div className="mt-4 text-center">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 text-left">Email: <span className="font-semibold text-gray-700">{email}</span></span>
                            <button
                                className="text-[#009688] hover:underline text-sm"
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setOtp(new Array(6).fill(""));
                                }}
                            >
                                &larr; Back
                            </button>
                        </div>
                        <h2 className="text-lg font-semibold mb-2 text-gray-800">Enter OTP</h2>
                        <div className="flex justify-center gap-3 mb-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    maxLength={1}
                                    ref={(el) => {
                                        otpInputs.current[index] = el;
                                    }}
                                    className="w-12 h-12 border border-gray-300 rounded-lg text-center text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#009688] text-gray-800"
                                />
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={verifyLoading || verifyOtpLoading}
                            className={`mt-4 w-full py-3 rounded-lg font-semibold transition ${(verifyLoading || verifyOtpLoading) ? "bg-gray-400" : "bg-[#009688] hover:bg-[#00796b] text-white"}`}
                        >
                            {(verifyLoading || verifyOtpLoading) ? "Verifying..." : "Verify OTP"}
                        </button>
                        <div className="mt-3 text-sm text-gray-500">
                            {resendTimer > 0 ? (
                                <p>Resend OTP in {resendTimer} sec</p>
                            ) : (
                                <button 
                                    onClick={handleSubmit} 
                                    disabled={sendOtpLoading}
                                    className={`${sendOtpLoading ? "text-gray-400" : "text-[#009688] hover:underline"}`}
                                >
                                    {sendOtpLoading ? "Sending..." : "Resend OTP"}
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {otpVerified && !resetSuccess && (
                    <form onSubmit={handleResetPassword} className="mt-4 space-y-5">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-500 text-left">Email: <span className="font-semibold text-gray-700">{email}</span></span>
                            <button
                                className="text-[#009688] hover:underline text-sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOtpVerified(false);
                                }}
                            >
                                &larr; Back
                            </button>
                        </div>
                        <h2 className="text-lg font-semibold mb-2 text-center text-gray-800">Set New Password</h2>
                        <input
                            type="password"
                            placeholder="New Password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#009688] text-gray-800"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#009688] text-gray-800"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            disabled={resetLoading || resetPasswordLoading}
                            className={`w-full py-2 rounded-lg font-semibold ${(resetLoading || resetPasswordLoading) ? "bg-gray-400" : "bg-[#009688] hover:bg-[#00796b] text-white"}`}
                        >
                            {(resetLoading || resetPasswordLoading) ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}

                {resetSuccess && (
                    <div className="mt-6 text-center text-green-600 font-semibold">
                        Password reset successful! Redirecting to login...
                    </div>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswprd;