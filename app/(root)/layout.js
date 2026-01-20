"use client"
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import GlobalLoading from "@/components/GlobalLoading";
import getUserInfo from '@/lib/actions/user.actions';

const RootLayout = ({ children }) => {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const fetchUserData = async () => {
            const userInfo = await getUserInfo();
            if (userInfo) {
                setUser(userInfo);
            } else {
                router.push('/sign-in');
            }
        };

        fetchUserData();
    }, [router]);

    useEffect(() => {
        if (user) {
            // console.log(user);
        }
    }, [user]);

    if (!user) {
        return <div>Loading...</div>; // or a loading indicator
    }

    return (
        <main className="flex h-screen w-full font-inter">
            <Sidebar user={user} />
            <div className="flex size-full flex-col">
                <div className="root-layout">
                    <Image src="/icons/logo.svg" width={30} height={30} alt="logo" />
                    <div>
                        <MobileNav user={user} />
                    </div>
                </div>
                <GlobalLoading>
                    {children}
                </GlobalLoading>
            </div>
        </main>
    );
};

export default RootLayout;
