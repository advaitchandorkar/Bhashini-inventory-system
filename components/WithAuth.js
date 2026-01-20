"use client"
// withAuth.js (Higher-order component for authentication)

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const getUserInfo = async () => {
    try {
        return await api.get("/api/auth/me");
    } catch (error) {
        console.error("Error fetching user details", error);
        return null;
    }
};

const withAuth = (WrappedComponent) => {
    return (props) => {
        const router = useRouter();

        useEffect(() => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/sign-in');
                return;
            }

            const fetchUserData = async () => {
                const userInfo = await getUserInfo();
                if (!userInfo) {
                    router.push('/sign-in');
                }
            };

            fetchUserData();
        }, []);

        return <WrappedComponent {...props} />;
    };
};

export default withAuth;
