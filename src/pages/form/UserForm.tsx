import React, { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { User, MapPin, Shield, CheckCircle, AlertCircle, Users, Building, Smartphone, Mail, Calendar, Key } from 'lucide-react';
import axios from 'axios';
import { fetchWFSFeatures } from '../../UtilsServices/MapUtils';


// Sample data - replace with actual API calls
const statesList = [
    { value: 'Maharashtra', label: 'Maharashtra' }
];

const designations = [
    { value: 'SLR', label: 'SLR (Settlement Land Records)' },
    { value: 'Tehsildar', label: 'Tehsildar' },
    { value: 'DSLR', label: 'DSLR (Deputy Settlement Land Records)' },
    { value: 'Surveyor', label: 'Surveyor' },
    { value: 'Patwari', label: 'Patwari' },
];

const validationSchema = (role: 'AU' | 'UU' | 'GU') =>
    Yup.object().shape({
        firstName: Yup.string()
            .min(2, 'First name must be at least 2 characters')
            .max(50, 'First name cannot exceed 50 characters')
            .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces')
            .when([], {
                is: () => role !== 'GU',
                then: (schema) => schema.required('First name is required'),
                otherwise: (schema) => schema.notRequired(),
            }),

        lastName: Yup.string()
            .min(2, 'Last name must be at least 2 characters')
            .max(50, 'Last name cannot exceed 50 characters')
            .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces')
            .when([], {
                is: () => role !== 'GU',
                then: (schema) => schema.required('Last name is required'),
                otherwise: (schema) => schema.notRequired(),
            }),

        dob: Yup.date()
            .max(new Date(Date.now() - 567648000000), 'User must be at least 18 years old')
            .when([], {
                is: () => role !== 'GU',
                then: (schema) => schema.required('Date of birth is required'),
                otherwise: (schema) => schema.notRequired(),
            }),

        mobile: Yup.string()
            .matches(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
            .required('Mobile number is required'),

        email: Yup.string()
            .email('Enter a valid email address')
            .required('Email is required'),

        designation: Yup.string().when([], {
            is: () => role !== 'GU',
            then: (schema) => schema.required('Designation is required'),
            otherwise: (schema) => schema.notRequired(),
        }),

        state: Yup.string().when([], {
            is: () => role !== 'GU',
            then: (schema) => schema.required('State is required'),
            otherwise: (schema) => schema.notRequired(),
        }),

        district: Yup.string().when([], {
            is: () => role !== 'GU',
            then: (schema) => schema.required('District is required'),
            otherwise: (schema) => schema.notRequired(),
        }),

        taluka: Yup.string().when('designation', {
            is: (val: string) =>
                ['Tehsildar', 'Patwari', 'Surveyor', 'DSLR'].includes(val) && role === 'UU',
            then: (schema) => schema.required('Taluka is required'),
            otherwise: (schema) => schema.notRequired(),
        }),

        gp: Yup.string().when('designation', {
            is: (val: string) => ['Patwari', 'Surveyor'].includes(val) && role === 'UU',
            then: (schema) => schema.required('GP (Gram Panchayat) is required'),
            otherwise: (schema) => schema.notRequired(),
        }),

        villageList: Yup.array().when('designation', {
            is: (val: string) => ['Patwari', 'Surveyor'].includes(val) && role === 'UU',
            then: (schema) => schema.min(1, 'Select at least one village'),
            otherwise: (schema) => schema.notRequired(),
        }),

        username: Yup.string()
            .min(4, 'Username must be at least 4 characters')
            .max(30, 'Username cannot exceed 30 characters')
            .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
            .when([], {
                is: () => role === 'UU' || role === 'GU',
                then: (schema) => schema.required('Username is required'),
                otherwise: (schema) => schema.notRequired(),
            }),

        password: Yup.string()
            .min(8, 'Password must be at least 8 characters')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
            )
            .when([], {
                is: () => role === 'UU' || role === 'GU',
                then: (schema) => schema.required('Password is required'),
                otherwise: (schema) => schema.notRequired(),
            }),
    });

interface FormValues {
    firstName: string;
    lastName: string;
    dob: string;
    mobile: string;
    email: string;
    designation: string;
    state: string;
    district: string;
    taluka: string;
    gp: string;
    villageList: string[];
    username: string;
    password: string;
}

interface UserForm {
    ROLE?: 'AU' | 'UU' | 'GU';
}


const buildPayload = (values: any, role: 'AU' | 'UU' | 'GU') => {
    const payload: any = {
        USER_ROLE: role,
        email: values.email,
        mobile_no: values.mobile,
    };

    if (role === 'UU') {
        payload.username = values.username;
        payload.password = values.password;
        payload.first_name = values.firstName;
        payload.last_name = values.lastName;
        payload.DOB = values.dob;
        payload.DESIGNATION = values.designation;
        payload.STATE = values.state;
        payload.DISTRICT = values.district;
        payload.TALUKA = values.taluka;
        payload.GP = values.gp;

        if (Array.isArray(values.villageList) && values.villageList.length > 0) {
            payload.VILLAGE_LIST = values.villageList.join(', ');
        }
    }

    if (role === 'GU') {
        payload.username = values.username;
        payload.password = values.password;
    }

    if (role === 'AU') {
        if (values.firstName) payload.first_name = values.firstName;
        if (values.lastName) payload.last_name = values.lastName;
        if (values.designation) payload.DESIGNATION = values.designation;
        if (values.state) payload.STATE = values.state;
        if (values.district) payload.DISTRICT = values.district;
    }

    return payload;
};




const UserForm: React.FC<UserForm> = ({ ROLE = "AU" }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [states] = useState<any[]>(statesList);
    const [features, setFeatures] = useState<any[]>([]);

    // State definitions
    const [selectedState, setSelectedState] = useState<string>('Maharashtra');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedTaluka, setSelectedTaluka] = useState<string>('');

    const [districts, setDistricts] = useState<string[]>([]);
    const [talukas, setTalukas] = useState<string[]>([]);
    const [villages, setVillages] = useState<string[]>([]);
    const [villageSearch, setVillageSearch] = useState('');

    const getInitialValues = (): FormValues => ({
        firstName: '',
        lastName: '',
        dob: '',
        mobile: '',
        email: '',
        designation: '',
        state: ROLE !== 'GU' ? 'Maharashtra' : '',
        district: '',
        taluka: '',
        gp: '',
        villageList: [],
        username: '',
        password: ''
    });

    // Load features on component mount
    useEffect(() => {
        if (ROLE === 'GU') {
            setLoading(false);
            return;
        }

        const loadFeatures = async () => {
            try {
                setLoading(true);
                const feats = await fetchWFSFeatures({
                    workspace: 'lpmkprathNew',
                    layerName: 'MHADMINPO_GCS',
                    propertyNames: ['STENAME', 'DIST_NAME', 'TEHSIL_NAM', 'VIL_ANNO'],
                });

                setFeatures(feats);
                console.log('Features loaded:', feats);
            } catch (error) {
                console.error('Error loading features:', error);
            } finally {
                setLoading(false);
            }
        };

        loadFeatures();
    }, [ROLE]);

    // Filter districts when state changes or features are loaded
    useEffect(() => {
        if (features?.length > 0 && selectedState) {
            const districtList = features
                .filter(f => f.properties.STENAME === selectedState)
                .map(f => f.properties.DIST_NAME);

            const uniqueDistricts = [...new Set(districtList)];
            setDistricts(uniqueDistricts);
            console.log('Districts for', selectedState, ':', uniqueDistricts);
        }
    }, [selectedState, features]);

    // Filter talukas when district changes
    useEffect(() => {
        if (features?.length > 0 && selectedState && selectedDistrict) {
            const talukaList = features
                .filter(f =>
                    f.properties.STENAME === selectedState &&
                    f.properties.DIST_NAME === selectedDistrict
                )
                .map(f => f.properties.TEHSIL_NAM);

            const uniqueTalukas = [...new Set(talukaList)];
            setTalukas(uniqueTalukas);
            console.log('Talukas for', selectedDistrict, ':', uniqueTalukas);
        } else {
            setTalukas([]);
        }
    }, [selectedState, selectedDistrict, features]);

    // Filter villages when taluka changes
    useEffect(() => {
        if (features?.length > 0 && selectedState && selectedDistrict && selectedTaluka) {
            const villageList = features
                .filter(
                    f =>
                        f.properties.STENAME === selectedState &&
                        f.properties.DIST_NAME === selectedDistrict &&
                        f.properties.TEHSIL_NAM === selectedTaluka
                )
                .map(f => f.properties.VIL_ANNO);

            setVillages([...new Set(villageList)]);
        } else {
            setVillages([]);
        }
    }, [selectedState, selectedDistrict, selectedTaluka, features]);

    // Reset form state when role changes
    useEffect(() => {
        setSelectedState('Maharashtra');
        setSelectedDistrict('');
        setSelectedTaluka('');
        setVillageSearch('');
        setSubmitMessage(null);
    }, [ROLE]);

    const handleSubmit = async (values: FormValues, { resetForm }: any) => {
        setIsSubmitting(true);
        setSubmitMessage(null);

        try {
            const payload = buildPayload(values, ROLE);
            console.log('Form submitted with payload:', payload);

            // Mock API call for demo - replace with your actual API
            const response = await axios.post(
                `${import.meta.env.VITE_LKM_BASE_URL}/fastapi/auth/signup`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Simulate API delay for demo
            await new Promise(resolve => setTimeout(resolve, 2000));

            const roleNames = {
                AU: 'Admin',
                UU: 'Regular',
                GU: 'General'
            };

            setSubmitMessage({
                type: 'success',
                message: `${roleNames[ROLE]} user created successfully! Login credentials have been sent via email.`,
            });

            resetForm();
            setSelectedDistrict('');
            setSelectedTaluka('');
        } catch (error: any) {
            console.error('Submit error:', error?.response || error.message);
            setSubmitMessage({
                type: 'error',
                message: error?.response.data.detail || 'Failed to create user. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getRoleDisplayName = () => {
        switch (ROLE) {
            case 'AU': return 'Admin';
            case 'UU': return 'Authorized';
            case 'GU': return 'General';
            default: return 'User';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-teal-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading form data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-2 px-4 sm:px-6 lg:px-8 mt-6">
            <div className="max-w-4xl mx-auto ">
                <div className="text-center mb-4">
                    {/* <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-600 to-blue-600 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div> */}
                    <h1 className="text-2xl font-bold text-gray-900 mb-1 ">
                        Create {getRoleDisplayName()} User Account
                    </h1>
                    <p className="text-gray-600">
                        Fill in the details below to create a new {getRoleDisplayName().toLowerCase()} user account
                    </p>
                </div>

                {submitMessage && (
                    <div className={`mb-4 p-4 rounded-lg border transition-all duration-300 ${submitMessage.type === 'success'
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        <div className="flex items-center">
                            {submitMessage.type === 'success' ? (
                                <CheckCircle className="w-5 h-5 mr-2" />
                            ) : (
                                <AlertCircle className="w-5 h-5 mr-2" />
                            )}
                            {submitMessage.message}
                        </div>
                    </div>
                )}

                <Formik
                    key={ROLE} // Force re-render when role changes
                    initialValues={getInitialValues()}
                    validationSchema={validationSchema(ROLE)}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, setFieldValue }) => (
                        <Form className="space-y-6">
                            {/* Personal Information - Only for AU and UU */}
                            {ROLE !== 'GU' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-teal-600" />
                                        Personal Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                First Name *
                                            </label>
                                            <Field
                                                name="firstName"
                                                className={`w-full px-4 py-1 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.firstName && touched.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter first name"
                                            />
                                            <ErrorMessage name="firstName" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                Last Name *
                                            </label>
                                            <Field
                                                name="lastName"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.lastName && touched.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter last name"
                                            />
                                            <ErrorMessage name="lastName" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1  flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Date of Birth *
                                            </label>
                                            <Field
                                                type="date"
                                                name="dob"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.dob && touched.dob ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            />
                                            <ErrorMessage name="dob" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1  flex items-center">
                                                <Smartphone className="w-4 h-4 mr-1" />
                                                Mobile Number *
                                            </label>
                                            <Field
                                                name="mobile"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.mobile && touched.mobile ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter 10-digit mobile number"
                                            />
                                            <ErrorMessage name="mobile" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1  flex items-center">
                                                <Mail className="w-4 h-4 mr-1" />
                                                Email Address *
                                            </label>
                                            <Field
                                                type="email"
                                                name="email"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.email && touched.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter email address"
                                            />
                                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Basic Information for GU */}
                            {ROLE === 'GU' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                                        <User className="w-5 h-5 mr-2 text-teal-600" />
                                        Basic Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1  flex items-center">
                                                <Mail className="w-4 h-4 mr-1" />
                                                Email Address *
                                            </label>
                                            <Field
                                                type="email"
                                                name="email"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.email && touched.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter email address"
                                            />
                                            <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1  flex items-center">
                                                <Smartphone className="w-4 h-4 mr-1" />
                                                Mobile Number *
                                            </label>
                                            <Field
                                                name="mobile"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.mobile && touched.mobile ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter 10-digit mobile number"
                                            />
                                            <ErrorMessage name="mobile" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Role & Designation - Only for AU and UU */}
                            {ROLE !== 'GU' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <Building className="w-5 h-5 mr-2 text-teal-600" />
                                        Designation
                                    </h2>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                            Designation *
                                        </label>

                                        {ROLE === "AU" ? (
                                            <Field
                                                name="designation"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.designation && touched.designation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter designation"
                                            />
                                        ) : (
                                            <Field
                                                as="select"
                                                name="designation"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.designation && touched.designation ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select Designation</option>
                                                {designations.map((designation) => (
                                                    <option key={designation.value} value={designation.value}>
                                                        {designation.label}
                                                    </option>
                                                ))}
                                            </Field>
                                        )}

                                        <ErrorMessage name="designation" component="div" className="text-red-500 text-sm mt-1" />
                                    </div>
                                </div>
                            )}

                            {/* Jurisdiction - Only for AU and UU */}
                            {ROLE !== 'GU' && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-teal-600" />
                                        Jurisdiction
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                State *
                                            </label>
                                            <Field
                                                as="select"
                                                name="state"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.state && touched.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    const newState = e.target.value;
                                                    setSelectedState(newState);
                                                    setFieldValue('state', newState);
                                                    setFieldValue('district', '');
                                                    setFieldValue('taluka', '');
                                                    setSelectedDistrict('');
                                                }}
                                            >
                                                <option value="">Select State</option>
                                                {states?.map((state) => (
                                                    <option key={state.value} value={state.value}>
                                                        {state.label}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="state" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                District *
                                            </label>
                                            <Field
                                                as="select"
                                                name="district"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.district && touched.district ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                    const newDistrict = e.target.value;
                                                    setSelectedDistrict(newDistrict);
                                                    setFieldValue('district', newDistrict);
                                                    setFieldValue('taluka', '');
                                                }}
                                            >
                                                <option value="">Select District</option>
                                                {districts?.map((district) => (
                                                    <option key={district} value={district}>
                                                        {district}
                                                    </option>
                                                ))}
                                            </Field>
                                            <ErrorMessage name="district" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {(values.designation === 'DSLR' || values.designation === "Tehsildar" || values.designation === 'Patwari' || values.designation === 'Surveyor') && (
                                            <div className="transition-opacity duration-300">
                                                <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                    Taluka *
                                                </label>
                                                <Field
                                                    as="select"
                                                    name="taluka"
                                                    className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.taluka && touched.taluka ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                        }`}
                                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                        const newTaluka = e.target.value;
                                                        setSelectedTaluka(newTaluka);
                                                        setFieldValue('taluka', newTaluka);
                                                    }}
                                                >
                                                    <option value="">Select Taluka</option>
                                                    {talukas?.map((taluka) => (
                                                        <option key={taluka} value={taluka}>
                                                            {taluka}
                                                        </option>
                                                    ))}
                                                </Field>
                                                <ErrorMessage name="taluka" component="div" className="text-red-500 text-sm mt-1" />
                                            </div>
                                        )}

                                        {(values.designation === 'Patwari' || values.designation === 'Surveyor') && (
                                            <>
                                                <div className="transition-opacity duration-300">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                        GP (Gram Panchayat) *
                                                    </label>
                                                    <Field
                                                        name="gp"
                                                        className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.gp && touched.gp ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                            }`}
                                                        placeholder="Enter Gram Panchayat name"
                                                    />
                                                    <ErrorMessage name="gp" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>
                                                <div className="md:col-span-2 transition-opacity duration-300">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1  flex items-center">
                                                        <Users className="w-4 h-4 mr-1" />
                                                        Village List * (Select multiple villages)
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Left side - Available Villages */}
                                                        <div className="flex flex-col space-y-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Search villages..."
                                                                className="w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors border-gray-300"
                                                                value={villageSearch}
                                                                onChange={(e) => setVillageSearch(e.target.value)}
                                                            />
                                                            <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-48 overflow-y-auto p-2">
                                                                {villages
                                                                    .filter(village =>
                                                                        village.toLowerCase().includes(villageSearch.toLowerCase().trim()) &&
                                                                        !values.villageList.includes(village)
                                                                    )
                                                                    .map((village) => (
                                                                        <div
                                                                            key={village}
                                                                            className="cursor-pointer hover:bg-teal-50 p-2 rounded-md transition-colors"
                                                                            onClick={() => setFieldValue('villageList', [...values.villageList, village])}
                                                                        >
                                                                            <span className="text-sm text-gray-700">{village}</span>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                        </div>

                                                        {/* Right side - Selected Villages */}
                                                        <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-60 overflow-y-auto p-2">
                                                            {values.villageList.map((village) => (
                                                                <div
                                                                    key={village}
                                                                    className="flex justify-between items-center bg-white p-2 mb-1 rounded-md shadow-sm"
                                                                >
                                                                    <span className="text-sm text-gray-700">{village}</span>
                                                                    <button
                                                                        type="button"
                                                                        className="text-red-500 hover:text-red-700 transition-colors"
                                                                        onClick={() => setFieldValue('villageList', values.villageList.filter(v => v !== village))}
                                                                    >
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            {values.villageList.length === 0 && (
                                                                <div className="text-sm text-gray-500 p-2">No villages selected</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <ErrorMessage name="villageList" component="div" className="text-red-500 text-sm mt-1" />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Login Credentials - For UU and GU */}
                            {(ROLE === "UU" || ROLE === "GU") && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-300 hover:shadow-md">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                        <Key className="w-5 h-5 mr-2 text-teal-600" />
                                        Login Credentials
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                Username *
                                            </label>
                                            <Field
                                                name="username"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.username && touched.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter username"
                                            />
                                            <ErrorMessage name="username" component="div" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1 ">
                                                Password *
                                            </label>
                                            <Field
                                                type="password"
                                                name="password"
                                                className={`w-full px-4 py-1  border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors ${errors.password && touched.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                                    }`}
                                                placeholder="Enter secure password"
                                            />
                                            <ErrorMessage name="password" component="div" className="text-red-500 text-sm mt-1" />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Password must contain uppercase, lowercase, number, and special character
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4 pt-6">
                                <button
                                    type="button"
                                    className="px-6 py-1  border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => window.location.reload()}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-3 bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-lg hover:from-teal-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creating User...
                                        </>
                                    ) : (
                                        `Create ${getRoleDisplayName()} User`
                                    )}
                                </button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default UserForm;