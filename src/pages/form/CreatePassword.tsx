import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Shield, Check, X } from 'lucide-react';
import axios from 'axios';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CreatePasswordProps {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  apiEndpoint?: string;
}

interface FormValues {
  new_password1: string;
  new_password2: string;
}

// Yup validation schema
const passwordSchema = Yup.object().shape({
  new_password1: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/(?=.*[a-z])/, 'Password must contain at least one lowercase letter')
    .matches(/(?=.*[A-Z])/, 'Password must contain at least one uppercase letter')
    .matches(/(?=.*\d)/, 'Password must contain at least one number')
    .matches(/(?=.*[@$!%*?&])/, 'Password must contain at least one special character')
    .required('Password is required'),
  new_password2: Yup.string()
    .oneOf([Yup.ref('new_password1')], 'Passwords do not match')
    .required('Password confirmation is required')
});

const CreatePassword: React.FC<CreatePasswordProps> = ({

}) => {

  const params = useParams();
  const token = params["*"];
  const uidb64 = params["id"];

  const navigate = useNavigate()

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [valid, setValid] = useState(false);
  const [expToken, setexpToken] = useState('');

  const initialValues: FormValues = {
    new_password1: '',
    new_password2: ''
  };

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: any) => {

    setGeneralError('');
    setSuccess(false);

    try {
      const response = await axios.post(`${(import.meta as any).env.VITE_LKM_BASE_URL}/api/${uidb64}/${token}`, values, {
        headers: {
          'Content-Type': 'application/json',
          // withCredentials: true 
        }
      });
      // console.log(response, "___response");

      if (response.data) {

        toast.success("Password Set Successfully")

        resetForm();
        setSuccess(false);
        setShowPassword1(false);
        setShowPassword2(false);
        navigate("/login")
      }

    } catch (error: any) {

      const errorMessage = error.response.data.detail || 'Failed to create password. Please try again.';
      setGeneralError(errorMessage);

    } finally {
      setSubmitting(false);
    }
  };

  const clearForm = (resetForm: () => void) => {
    resetForm();
    setGeneralError('');
    setSuccess(false);
    setShowPassword1(false);
    setShowPassword2(false);
  };



  // console.log(token);
  // console.log(id);

  useEffect(() => {
    const fetchTokenStatus = async () => {
      try {
        const response = await axios.get(
          `${(import.meta as any).env.VITE_LKM_BASE_URL}/api/${uidb64}/${token}`
        );
        const data = response.data;
        console.log(data);
        if (data.detail === 'Link has expired.') {
          setexpToken('This activation link has expired.');
        } else if (data.detail === 'Invalid or expired token.') {
          setexpToken('Invalid activation link.');
        } else {
          setValid(true); // Show password form
        }
      } catch (error: any) {

        console.log(error?.response?.data?.detail);
        // Fallback if API fails or returns unexpected error
        setexpToken(error?.response?.data?.detail || 'Something went wrong. Please try again later.');

      }
    };

    fetchTokenStatus();
  }, [token, uidb64]);


  if (expToken) {
    return (
      <>
        {expToken && (
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-500 mb-4">{expToken}</h2>
            </div>
          </div>
        )}
      </>
    )
  }


  return (
    <>

      {
        !expToken && (
          <div className='flex justify-center items-center h-screen'>
            <div className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200">
              <div className="p-6 sm:p-6">
                <div className="flex items-center mb-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg mr-3">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-playfair font-semibold text-gray-800">
                    Create Password
                  </h2>
                </div>



                {generalError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <X className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-700">{generalError}</span>
                  </div>
                )}

                <Formik
                  initialValues={initialValues}
                  validationSchema={passwordSchema}
                  onSubmit={handleSubmit}
                >
                  {({ values, errors, touched, isSubmitting, resetForm }) => (
                    <Form>
                      <div className="grid grid-cols-1  gap-4 sm:gap-6">
                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 font-raleway">
                            New Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              className={`input-box pr-10 ${errors.new_password1 && touched.new_password1 ? 'border-red-300 focus:ring-red-500' : ''}`}
                              type={showPassword1 ? "text" : "password"}
                              name="new_password1"
                              placeholder="Enter new password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={() => setShowPassword1(!showPassword1)}
                            >
                              {showPassword1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <ErrorMessage name="new_password1" component="p" className="text-xs text-red-600 mt-1" />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-sm font-medium text-gray-700 font-raleway">
                            Confirm Password <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Field
                              className={`input-box pr-10 ${errors.new_password2 && touched.new_password2 ? 'border-red-300 focus:ring-red-500' : ''}`}
                              type={showPassword2 ? "text" : "password"}
                              name="new_password2"
                              placeholder="Confirm new password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              onClick={() => setShowPassword2(!showPassword2)}
                            >
                              {showPassword2 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <ErrorMessage name="new_password2" component="p" className="text-xs text-red-600 mt-1" />
                          {values.new_password2 &&
                            values.new_password1 === values.new_password2 &&
                            values.new_password1 &&
                            !errors.new_password2 && (
                              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Passwords match
                              </p>
                            )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-6 justify-end">
                        <button
                          type="button"
                          onClick={() => clearForm(resetForm)}
                          className="btn_base btn-secondary"
                          disabled={isSubmitting}
                        >
                          Clear Form
                        </button>
                        <button
                          type="submit"
                          className="btn_base btn-primary"
                          disabled={isSubmitting || !values.new_password1 || !values.new_password2}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Creating...
                            </div>
                          ) : (
                            'Sumbit'
                          )}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        )
      }


    </>
  );
};

export default CreatePassword;