import { createSlice } from '@reduxjs/toolkit';

const themeSlice = createSlice({
    name: 'theme',
    initialState: 'light',
    reducers: {
        setTheme: (state, action) => {
            return action.payload;
        },
        toggleTheme: (state) => {
            return state === 'light' ? 'dark' : 'light';
        },
    }
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;