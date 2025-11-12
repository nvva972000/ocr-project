import React from "react";
import { BodyContainer, ContentContainer } from "./MainBody";
import Sidebar from "./components/sidebar/SideBar.tsx";
import { Outlet } from "react-router-dom";

interface MainBodyProps {
    isCollapsed: boolean;
}

const MainBody: React.FC<MainBodyProps> = ({ isCollapsed }) => {
    return (
        <BodyContainer>
            <Sidebar isCollapsed={isCollapsed} />
            <ContentContainer>
                <Outlet />
            </ContentContainer>
        </BodyContainer>
    );
};

export default MainBody;

