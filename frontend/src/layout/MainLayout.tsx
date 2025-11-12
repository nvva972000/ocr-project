import React, { useEffect, useState } from "react";
import { MainContainer } from "./MainLayout";
import Header from "./Header.tsx";
import MainBody from "./MainBody.tsx";

const MainLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            // Handle click outside if needed
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <MainContainer>
            <Header onToggleSidebar={toggleSidebar} />
            <MainBody isCollapsed={isCollapsed} />
        </MainContainer>
    );
};

export default MainLayout;

