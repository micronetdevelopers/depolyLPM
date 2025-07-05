import React, { useEffect, useState } from 'react';
import { BookOpen, Edit, Eye, Filter, Plus, Trash2, Shield, ShieldOff, User, Mail, Phone, MapPin, Calendar, Badge, AlertTriangle } from 'lucide-react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { useGetAdminsQuery, useUpdateStatusMutation, useDeleteUserMutation } from '../../features/services/apiSlice';
import UserForm from '../form/UserForm';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusColorMap = {
    Active: 'bg-green-100 text-green-800',
    Inactive: 'bg-red-100 text-red-800',
    Block: 'bg-gray-300 text-gray-700',
    Pending: 'bg-yellow-100 text-yellow-800',
};

export const SuperuserDash: React.FC = () => {
    const { data: adminsData, isLoading, isError } = useGetAdminsQuery();
    const [updateStatus] = useUpdateStatusMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'AU' | 'UU' | 'GU'>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateAdminModalOpen, setIsCreateAdminModalOpen] = useState(false);
    const navigate = useNavigate();

    // Combine all user types into a single array
    useEffect(() => {
        if (adminsData) {
            const allUsers = [
                ...(adminsData.AU || []),
                ...(adminsData.UU || []),
                ...(adminsData.GU || [])
            ];
            setUsers(allUsers);
        }
    }, [adminsData]);

    const handleViewUser = (user: any) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const handleApprove = async (user: any) => {
        try {
            await updateStatus({ user_id: user.USER_ID, status: "Active" }).unwrap();
            toast.success("User approved successfully");
        } catch (error) {
            toast.error("Failed to approve user");
        }
    };

    const handleReject = async (user: any) => {
        try {
            const response = await updateStatus({ user_id: user.USER_ID, status: "Inactive" }).unwrap();
            console.log(response);
            toast.success("User rejected successfully");
        } catch (error) {
            console.log(error);
            toast.error("Failed to reject user");
        }
    };

    const handleBlock = async (user: any) => {

        console.log(user, "---block");

        try {
            await updateStatus({ user_id: user?.USER_ID, status: "Block" }).unwrap();
            toast.success("User blocked successfully");
        } catch (error) {
            console.log(error, "---block");
            toast.error("Failed to block user");
        }
    };

    const handleUnblock = async (user: any) => {
        try {
            await updateStatus({ user_id: user.USER_ID, status: "Active" }).unwrap();
            toast.success("User unblocked successfully");
        } catch (error) {
            toast.error("Failed to unblock user");
        }
    };

    const handleDeleteClick = (user: any) => {
        setUserToDelete(user);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (userToDelete) {
            try {
                await deleteUser({ user_id: userToDelete.USER_ID }).unwrap();
                toast.success("User deleted successfully");
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
            } catch (error) {
                toast.error("Failed to delete user");
            }
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
    };

    // Add resend link handler (mocked for now)
    const handleResendLink = async (user: any) => {
        // TODO: Replace with actual API call
        toast.success(`Resend link sent to ${user.email}`);
    };

    const filteredUsers = users?.filter(user => {
        if (activeTab !== 'all' && user?.USER_ROLE !== activeTab) {
            return false;
        }
        if (statusFilter === 'active' && user.ACTIVE_STATUS !== 'Active') {
            return false;
        }
        if (statusFilter === 'inactive' && user.ACTIVE_STATUS === 'Active') {
            return false;
        }
        return true;
    });

    const tabs = [
        { id: 'all', label: 'All Users', count: users.length },
        { id: 'AU', label: 'Admin', count: users.filter(u => u.USER_ROLE === 'AU').length },
        { id: 'UU', label: 'UU', count: users.filter(u => u.USER_ROLE === 'UU').length },
        { id: 'GU', label: 'GU', count: users.filter(u => u.USER_ROLE === 'GU').length },
    ];

    const columns = [
        {
            key: 'username',
            title: 'User',
            render: (value: string, record: any) => (
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600 uppercase">
                        {record.first_name?.charAt(0) || record.username?.charAt(0)}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{record.username}</div>
                        <div className="text-sm text-gray-500">{record.email}</div>
                    </div>
                </div>
            )
        },
        {
            key: 'mobile_no',
            title: 'Mobile',
            render: (value: string) => (
                <span className="text-sm text-gray-900">{value}</span>
            )
        },
        {
            key: 'USER_ROLE',
            title: 'Role',
            render: (value: string) => (
                <span className="text-sm text-gray-700">{value}</span>
            )
        },
        {
            key: 'designation',
            title: 'Designation',
            render: (value: string) => (
                <span className="text-sm text-gray-900">{value}</span>
            )
        },
        {
            key: 'location',
            title: 'Location',
            render: (value: any, record: any) => (
                <div className="text-sm text-gray-900">
                    {[record.VILLAGE, record.TALUKA, record.district, record.state]
                        .filter(Boolean)
                        .join(', ') || '—'}
                </div>
            )
        },
        {
            key: 'status',
            title: 'Status',
            render: (value: any, record: any) => (
                <div className="flex items-center space-x-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColorMap[record.ACTIVE_STATUS] || 'bg-gray-100 text-gray-800'}`}>
                        {record.ACTIVE_STATUS}
                    </span>
                </div>
            )
        },
        {
            key: 'actions',
            title: 'Actions',
            render: (value: any, record: any) => (
                <div className="flex items-center space-x-2">
                    {/* View button for all users */}
                    <button
                        onClick={() => handleViewUser(record)}
                        className="p-2 text-gray-500 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                        title="View Details"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    {/* AU users with Pending status: only Resend Link */}
                    {record.USER_ROLE === 'AU' && record.ACTIVE_STATUS === 'Pending' && (
                        <button
                            onClick={() => handleResendLink(record)}
                            className="px-3 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                        >
                            Resend Link
                        </button>
                    )}
                    {/* AU users with non-Pending and non-Delete status: show all actions */}
                    {record.USER_ROLE === 'AU' && record.ACTIVE_STATUS !== 'Delete' && record.ACTIVE_STATUS !== 'Pending' && (
                        <>
                            {/* Block/Unblock buttons */}
                            {record.ACTIVE_STATUS === "Active" && (
                                <button
                                    onClick={() => handleBlock(record)}
                                    className="p-2 text-gray-500 hover:text-orange-600 rounded-md hover:bg-orange-50 transition-colors"
                                    title="Block User"
                                >
                                    <ShieldOff className="w-4 h-4" />
                                </button>
                            )}
                            {record.ACTIVE_STATUS === "Block" && (
                                <button
                                    onClick={() => handleUnblock(record)}
                                    className="p-2 text-gray-500 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors"
                                    title="Unblock User"
                                >
                                    <Shield className="w-4 h-4" />
                                </button>
                            )}
                            {/* Approve/Reject buttons for non-active users */}
                            {record.ACTIVE_STATUS !== "Active" && record.ACTIVE_STATUS !== "Block" && (
                                <>
                                    <button
                                        onClick={() => handleApprove(record)}
                                        className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(record)}
                                        className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        Reject
                                    </button>
                                </>
                            )}
                            {/* Delete button for AU users, not if status is Delete */}
                            <button
                                onClick={() => handleDeleteClick(record)}
                                className="p-2 text-gray-500 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                title="Delete User"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    if (isLoading) return <div>Loading users...</div>;
    if (isError) return <div>Failed to load users</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary-100 rounded-lg">
                        <BookOpen className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            User Management
                        </h1>
                        <p className="text-gray-600">
                            Monitor and manage all system users
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-gray-900">
                        {users.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Users</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                        {users.filter(u => u.ACTIVE_STATUS === 'Active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active Users</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="text-2xl font-bold text-red-600">
                        {users.filter(u => u.ACTIVE_STATUS !== 'Active').length}
                    </div>
                    <div className="text-sm text-gray-600">Inactive Users</div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                    ? 'border-primary-500 text-primary-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label}
                                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                                    {tab.count}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Filters */}
                <div className="p-4 border-b border-gray-200 flex justify-between">
                    <div className="flex items-center space-x-4">
                        <Filter className="w-5 h-5 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white text-gray-900"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button onClick={() => navigate("/dashboard/sign-up-admin")} variant="primary" size="sm" icon={Plus} className="bg-primary-600 hover:bg-primary-700">
                            Create Admin
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <Table
                    columns={columns}
                    data={filteredUsers}
                    searchable
                    searchPlaceholder="Search users..."
                    onRowClick={() => { }}
                />
            </div>

            {/* Beautiful User Details Modal */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="User Details"
                size="lg"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        {/* User Header */}
                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-8 h-8 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">
                                    {selectedUser.first_name} {selectedUser.last_name}
                                </h3>
                                <p className="text-gray-600">@{selectedUser.username}</p>
                                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full mt-2 ${statusColorMap[selectedUser.ACTIVE_STATUS] || 'bg-gray-100 text-gray-800'}`}>
                                    {selectedUser.ACTIVE_STATUS}
                                </span>
                            </div>
                        </div>

                        {/* User Information Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Personal Information */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                    Personal Information
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Username</p>
                                            <p className="font-medium text-gray-900">{selectedUser.username}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email</p>
                                            <p className="font-medium text-gray-900">{selectedUser.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Mobile</p>
                                            <p className="font-medium text-gray-900">{selectedUser.mobile_no}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Role & Status */}
                            <div className="space-y-4">
                                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                    Role & Status
                                </h4>

                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <Badge className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Role</p>
                                            <p className="font-medium text-gray-900">{selectedUser.USER_ROLE}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Shield className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Designation</p>
                                            <p className="font-medium text-gray-900">{selectedUser.designation || '—'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColorMap[selectedUser.ACTIVE_STATUS] || 'bg-gray-100 text-gray-800'}`}>
                                                {selectedUser.ACTIVE_STATUS}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Information */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                                Location Information
                            </h4>

                            <div className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Full Address</p>
                                    <p className="font-medium text-gray-900">
                                        {[selectedUser.VILLAGE, selectedUser.TALUKA, selectedUser.district, selectedUser.state]
                                            .filter(Boolean)
                                            .join(', ') || 'No location information available'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons: Only for AU users and not if status is Delete */}
                        {selectedUser.USER_ROLE === 'AU' && selectedUser.ACTIVE_STATUS === 'Pending' && (
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                <Button
                                    onClick={() => {
                                        handleResendLink(selectedUser);
                                        setIsViewModalOpen(false);
                                    }}
                                    variant="outline"
                                    className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                                >
                                    Resend Link
                                </Button>
                            </div>
                        )}
                        {selectedUser.USER_ROLE === 'AU' && selectedUser.ACTIVE_STATUS !== 'Delete' && selectedUser.ACTIVE_STATUS !== 'Pending' && (
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                {selectedUser.ACTIVE_STATUS === "Active" && (
                                    <Button
                                        onClick={() => {
                                            handleBlock(selectedUser);
                                            setIsViewModalOpen(false);
                                        }}
                                        variant="outline"
                                        className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                    >
                                        <ShieldOff className="w-4 h-4 mr-2" />
                                        Block User
                                    </Button>
                                )}
                                {selectedUser.ACTIVE_STATUS === "Block" && (
                                    <Button
                                        onClick={() => {
                                            handleUnblock(selectedUser);
                                            setIsViewModalOpen(false);
                                        }}
                                        variant="outline"
                                        className="border-green-300 text-green-600 hover:bg-green-50"
                                    >
                                        <Shield className="w-4 h-4 mr-2" />
                                        Unblock User
                                    </Button>
                                )}
                                {selectedUser.ACTIVE_STATUS !== "Active" && selectedUser.ACTIVE_STATUS !== "Block" && (
                                    <>
                                        <Button
                                            onClick={() => {
                                                handleApprove(selectedUser);
                                                setIsViewModalOpen(false);
                                            }}
                                            variant="outline"
                                            className="border-green-300 text-green-600 hover:bg-green-50"
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                handleReject(selectedUser);
                                                setIsViewModalOpen(false);
                                            }}
                                            variant="outline"
                                            className="border-red-300 text-red-600 hover:bg-red-50"
                                        >
                                            Reject
                                        </Button>
                                    </>
                                )}
                                <Button
                                    onClick={() => {
                                        handleDeleteClick(selectedUser);
                                        setIsViewModalOpen(false);
                                    }}
                                    variant="outline"
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete User
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={handleDeleteCancel}
                title="Confirm Delete"
                size="md"
            >
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Delete User
                            </h3>
                            <p className="text-sm text-gray-600">
                                This action cannot be undone
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-700 mb-4">
                            Are you sure you want to delete user <strong>"{userToDelete?.username}"</strong>?
                        </p>
                        <p className="text-sm text-gray-500">
                            This will permanently remove the user from the system and all associated data will be lost.
                        </p>
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-4">
                        <Button
                            onClick={handleDeleteCancel}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteConfirm}
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};