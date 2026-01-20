"use client"
import React, { useEffect, useState } from 'react';
import HeaderBox from '@/components/HeaderBox';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import RightSidebar from '@/components/RightSidebar';
import AllData from '@/components/AllData';
import getUserInfo from '@/lib/actions/user.actions';
import AddItemsPanel from '@/components/AddItemsPanel';

const Home = () => {
    const [loggedIn, setLoggedIn] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const fetchUserData = async () => {
            const userInfo = await getUserInfo();
            setLoggedIn(userInfo);
            setLoading(false);
        };

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>; // or a loading indicator
    }

    return (
        <section className='home'>
            <div className="home-content ">
                <header className="home-header">
                    <HeaderBox
                        type='greeting'
                        title='Welcome'
                        user={loggedIn?.name || "Guest"}
                        subtext="Access and manage your Inventory efficiently"
                    />
                    <TotalBalanceBox
                        accounts={[]}
                        totalBanks={1}
                        totalCurrentBalance={1260.35}
                    />
                </header>
                <AddItemsPanel onSaved={() => setRefresh((prev) => prev + 1)} />
                <AllData key={refresh} />
            </div>
            <RightSidebar
                user={loggedIn}
                transactions={[]}
                banks={[{ currentBalance: 1234 }, { currentBalance: 4567 }]}
            />
        </section>
    );
};

export default Home;
