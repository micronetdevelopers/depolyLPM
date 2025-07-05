// src/services/apiSlice.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export const apiSlice = createApi({
  reducerPath: 'Api',
  baseQuery: fetchBaseQuery({
    baseUrl: `${(import.meta as any).env.VITE_LKM_BASE_URL}/fastapi`,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
      const csrfToken = getCookie('csrf_token');
      if (csrfToken) {
        headers.set('X-CSRFToken', csrfToken);
      }
      return headers;
    },
  }),

  tagTypes: ['get-user', 'Flights'], // Use proper tag types for invalidation
  endpoints: (builder) => ({
    // ✅ GET current admin/user details
    getAdmins: builder.query<any, void>({
      query: () => '/auth/users/details/',
      providesTags: ['get-user'],
    }),

    updateStatus: builder.mutation<any, { user_id: string; status: string }>({
      query: ({ user_id, status }) => ({
        url: `/auth/users/update-status/`,
        method: 'POST',
        body: { user_id, status },
      }),
      invalidatesTags: ['get-user'],
    }),

    // ✅ DELETE user using the same endpoint with "Delete" status
    deleteUser: builder.mutation<any, { user_id: string }>({
      query: ({ user_id }) => ({
        url: `/auth/users/update-status/`,
        method: 'POST',
        body: { user_id, status: 'Delete' },
      }),
      invalidatesTags: ['get-user'],
    }),

    getUserProfile: builder.query<any, void>({
      query: () => '/auth/user-profile/',
      providesTags: ['get-user'],
    }),

    // Forgot Password Endpoints
    sendOtp: builder.mutation<any, { email: string }>({
      query: ({ email }) => ({
        url: '/auth/forgot-password/send-otp/',
        method: 'POST',
        body: { email },
      }),
    }),

    verifyOtp: builder.mutation<any, { email: string; otp: string }>({
      query: ({ email, otp }) => ({
        url: '/auth/forgot-password/verify-otp/',
        method: 'POST',
        body: { email, otp },
      }),
    }),

    resetPassword: builder.mutation<any, { email: string; new_password: string; confirm_password: string }>({
      query: ({ email, new_password, confirm_password }) => ({
        url: '/auth/forgot-password/reset/',
        method: 'POST',
        body: { email, new_password, confirm_password },
      }),
    }),
  }),
});

// ✅ Export auto-generated hooks
export const {
  useGetAdminsQuery,
  useUpdateStatusMutation,
  useDeleteUserMutation,
  useGetUserProfileQuery,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useResetPasswordMutation
} = apiSlice;


