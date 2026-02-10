import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar isCollapsed={isCollapsed} />
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
                <Header onMenuClick={() => setIsCollapsed(!isCollapsed)} />
                <main className="p-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
