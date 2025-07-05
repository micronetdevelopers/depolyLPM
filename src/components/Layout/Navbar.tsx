import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Info, LayoutDashboard, Phone, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/store/authSlice';

const Navbar = () => {
    const { isAuthenticated } = useSelector((state: any) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const logOut = () => {
        dispatch(logout())
        navigate("/login")
    }
    return (
        <nav className="  bg-white  ">

            <div className=" max-w-7xl mx-auto flex justify-between items-center p-4   ">
                <div className="flex items-center space-x-3">
                    <img onClick={() => navigate('/')} src="/K-PRATH_LOGO.png" alt="logo" className="h-12 w-12" />
                    <div>
                        <h1 className="text-2xl font-bold text-purple-900">LPM</h1>
                        {/* <p className="text-sm text-gray-600">Create and manage user accounts</p> */}
                    </div>
                </div>
                <div className="flex items-center text-gray-500 cursor-pointer space-x-4 text-sm">
                    <Link to="/" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                        <Home size={16} />
                        <span>Home</span>
                    </Link>
                    <Link to="/about" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                        <Info size={16} />
                        <span>About</span>
                    </Link>

                    <Link to="/contact" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                        <Phone size={16} />
                        <span>Contact</span>
                    </Link>

                    {
                        isAuthenticated && (
                            <Link to="/modules" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                <LayoutDashboard size={16} />
                                <span>K-PRATH</span>
                            </Link>
                        )
                    }

                    {
                        isAuthenticated && (
                            <Link to="/dashboard" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                <LayoutDashboard size={16} />
                                <span>Dashboard</span>
                            </Link>
                        )
                    }



                    {/* Hide Sign Up and Login if authenticated */}
                    {!isAuthenticated && (
                        <>
                            <Link to="/sign-up" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                <User size={16} />
                                <span>Sign Up</span>
                            </Link>
                            <Link to="/login" className="flex items-center space-x-1 hover:text-red-500 transition-colors">
                                <User size={16} />
                                <span>Login</span>
                            </Link>
                        </>
                    )}

                    {
                        isAuthenticated && (
                            <span onClick={logOut } >
                                <Link to="/login" className="flex items-center space-x-1 text-red-500 transition-colors">

                                    <span>Logout</span>
                                </Link>
                            </span>
                        )
                    }
                </div>
            </div>


        </nav>
    );
};

export default Navbar;