import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);

    // TODO: Implement actual auth logic (fetch from /api/auth/me)

    const login = async (email, password) => {
        // Placeholder login
        console.log("Login attempted", email);
    };

    const value = {
        user,
        loading,
        login
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
