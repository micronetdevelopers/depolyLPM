import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    role: string
}

interface AuthState {
    Role: string | null;
    isAuthenticated: boolean;
}

const initialState: AuthState = {
    Role: null,
    isAuthenticated: false,

};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ Role: string }>) => {

            state.Role = action.payload.Role;
            localStorage.setItem('User_Role', action.payload.Role);
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.Role = null;
            localStorage.removeItem('User_Role');
            state.isAuthenticated = false;
        },
        restoreAuth: (state) => {
            const Role = localStorage.getItem('User_Role');

            if (Role) {
                state.Role = Role;
                state.isAuthenticated = true;

            }
        },
    },
});

export const { login, logout, restoreAuth } = authSlice.actions;
export default authSlice.reducer;