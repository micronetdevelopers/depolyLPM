import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import UserForm from './UserForm';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

function Signup() {
    const [role, setRole] = useState<'UU' | 'GU'>('UU');
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm ">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">

                            <img onClick={() => navigate('/')} src="/K-PRATH_LOGO.png" alt="logo" className="h-12 w-12" />
                            <div>
                            <h1 className="text-2xl font-bold text-purple-900">LPM</h1>
                                {/* <p className="text-sm text-gray-600">Create and manage user accounts</p> */}
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">

                            <button
                                onClick={() => setRole('UU')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${role === 'UU'
                                    ? 'bg-white text-teal-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Authorized User
                            </button>
                            <button
                                onClick={() => setRole('GU')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${role === 'GU'
                                    ? 'bg-white text-teal-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                General User
                            </button>
                        </div>

                        <Link to="/login">
                            <Button
                             
                                className="w-full btn_base btn-primary py-2 text-base font-medium"

                            >

                                Login
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Form */}
            <UserForm ROLE={role} />
        </div>
    );
}

export default Signup;