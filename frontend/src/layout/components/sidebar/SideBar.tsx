import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
    IconChevronRight,
    IconAlertCircle
} from '@tabler/icons-react';
import { SidebarContainer, SidebarSection, NavList, NavItem, NavLink, NavButton, MenuContent, ExpandIcon, SubNavList, ComingSoonBadge, staticMenuItems } from './Sidebar';
import type { MenuItem } from './Sidebar';

interface SidebarProps {
    isCollapsed: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed }) => {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

    const isActive = (path: string): boolean => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const isItemActive = (item: MenuItem): boolean => {
        if (isActive(item.path)) return true;
        if (item.children) {
            return item.children.some(child => isItemActive(child));
        }
        return false;
    };

    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleMenuClick = (item: MenuItem) => {
        if (item.children && item.children.length > 0) {
            toggleExpanded(item.id);
        }
    };

    const renderMenuItem = (item: MenuItem, level: number = 0) => {
        const IconComponent = item.icon;
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.id);
        const itemActive = isItemActive(item);
        const isNotReady = item.notReady;

        return (
            <React.Fragment key={item.id}>
                <NavItem>
                    {hasChildren ? (
                        <NavButton
                            $hasChildren={hasChildren}
                            $level={level}
                            $notReady={isNotReady}
                            className={itemActive ? 'active' : ''}
                            onClick={() => handleMenuClick(item)}
                            disabled={isNotReady}
                        >
                            <MenuContent>
                                <IconComponent size={12} />
                                {item.label}
                                {isNotReady && <ComingSoonBadge><IconAlertCircle size={12} /></ComingSoonBadge>}
                            </MenuContent>
                            <ExpandIcon $isExpanded={isExpanded}>
                                <IconChevronRight size={12} />
                            </ExpandIcon>
                        </NavButton>
                    ) : (
                        <NavLink
                            to={isNotReady ? '#' : item.path}
                            $hasChildren={hasChildren}
                            $level={level}
                            $notReady={isNotReady}
                            className={isActive(item.path) ? 'active' : ''}
                            onClick={(e) => {
                                if (isNotReady) {
                                    e.preventDefault();
                                }
                            }}
                        >
                            <MenuContent>
                                <IconComponent size={12} />
                                {item.label}
                                {isNotReady && <ComingSoonBadge><IconAlertCircle size={12} /></ComingSoonBadge>}
                            </MenuContent>
                        </NavLink>
                    )}
                </NavItem>

                {hasChildren && (
                    <SubNavList
                        $isExpanded={isExpanded}
                        $level={level}
                    >
                        {item.children?.map((subItem) => renderMenuItem(subItem, level + 1))}
                    </SubNavList>
                )}
            </React.Fragment>
        );
    };

    return (
        <SidebarContainer $collapsed={isCollapsed}>
            <SidebarSection>
                <NavList>
                    {staticMenuItems.map((item) => renderMenuItem(item))}
                </NavList>
            </SidebarSection>
        </SidebarContainer>
    );
};

export default Sidebar;

