import { Link } from "react-router-dom";
import styled from "styled-components";
import {
  IconDashboard,
  IconTrendingUp,
  IconSettings,
  IconUser,
  IconUserCog,
  IconBuilding,
  IconScan,
  IconHistory,
} from "@tabler/icons-react";

// Styled Components
const SidebarContainer = styled.aside<{ $collapsed: boolean }>`
  width: ${(props) => (props.$collapsed ? "0" : "280px")};
  background: white;
  border-right: 1px solid #e2e8f0;
  padding: 1rem 0;
  overflow-y: auto;
  font-size: 13px;
  height: calc(100vh - 48px);
  transition: width 0.3s ease;

  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
    transition: background 0.2s ease;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
`;

const SidebarSection = styled.div`
  margin-bottom: 2rem;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.25rem;
`;

const NavLink = styled(Link)<{
  $hasChildren?: boolean;
  $level: number;
  $notReady?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  padding-left: ${(props) => 2 + props.$level * 1}rem;
  color: ${(props) => (props.$notReady ? "#94a3b8" : "#1A3636")};
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  justify-content: ${(props) =>
    props.$hasChildren ? "space-between" : "flex-start"};
  opacity: ${(props) => (props.$notReady ? 0.6 : 1)};
  cursor: ${(props) => (props.$notReady ? "not-allowed" : "pointer")};

  &:hover {
    background: ${(props) => (props.$notReady ? "transparent" : "#E8F0F0")};
    color: ${(props) => (props.$notReady ? "#94a3b8" : "#2A5656")};
  }

  &.active {
    background: ${(props) => (props.$notReady ? "transparent" : "#D0E0E0")};
    color: #1A3636;
    font-weight: 600;
  }
`;

const NavButton = styled.button<{
  $hasChildren?: boolean;
  $level: number;
  $notReady?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 2rem;
  padding-left: ${(props) => 2 + props.$level * 1}rem;
  color: ${(props) => (props.$notReady ? "#94a3b8" : "#1A3636")};
  background: none;
  font-weight: 500;
  transition: all 0.2s ease;
  justify-content: ${(props) =>
    props.$hasChildren ? "space-between" : "flex-start"};
  width: 100%;
  cursor: ${(props) => (props.$notReady ? "not-allowed" : "pointer")};
  font-size: inherit;
  border: none;
  outline: none;
  opacity: ${(props) => (props.$notReady ? 0.6 : 1)};

  &:hover {
    border: none;
    outline: none;
    color: ${(props) => (props.$notReady ? "#94a3b8" : "#2A5656")};
    background: ${(props) => (props.$notReady ? "transparent" : "#E8F0F0")};
  }

  &:focus,
  &:focus-visible {
    border: none;
    outline: none;
    box-shadow: none;
  }

  &.active {
    border: none;
    outline: none;
    color: #1A3636;
    background: ${(props) => (props.$notReady ? "transparent" : "#D0E0E0")};
    font-weight: 600;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const MenuContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  transition: transform 0.2s ease;
  transform: rotate(${(props) => (props.$isExpanded ? "90deg" : "0deg")});
  display: flex;
  align-items: center;
`;

const SubNavList = styled.ul<{ $isExpanded: boolean; $level: number }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${(props) => (props.$isExpanded ? "block" : "none")};
`;

const ComingSoonBadge = styled.span`
  display: flex;
  align-items: center;
  color: rgb(247, 124, 1);
  border-radius: 0.25rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
  margin-left: auto;
`;

interface MenuItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  children?: MenuItem[];
  notReady?: boolean;
}

const staticMenuItems: MenuItem[] = [
  {
    id: "overview",
    path: "/overview",
    icon: IconDashboard,
    label: "Overview",
    notReady: false,
    children: [
      {
        id: "dashboard",
        path: "/dashboard",
        icon: IconTrendingUp,
        label: "Dashboard",
        notReady: false,
      },
    ],
  },
  {
    id: "iam",
    path: "/iam",
    icon: IconSettings,
    label: "IAM",
    notReady: false,
    children: [
      {
        id: "users",
        path: "/users",
        icon: IconUser,
        label: "Users",
        notReady: false,
      },
      {
        id: "roles",
        path: "/roles",
        icon: IconUserCog,
        label: "Roles",
        notReady: false,
      },
      {
        id: "org",
        path: "/org",
        icon: IconBuilding,
        label: "Org",
        notReady: false,
      },
    ],
  },
  {
    id: "ocr",
    path: "/ocr",
    icon: IconScan,
    label: "Optical Character Recognition",
    notReady: false,
  },
  {
    id: "activity-log",
    path: "/activity-log",
    icon: IconHistory,
    label: "Activity Log",
    notReady: false,
  },
];

export type { MenuItem };
export {
  staticMenuItems,
  SidebarContainer,
  SidebarSection,
  NavList,
  NavItem,
  NavLink,
  NavButton,
  MenuContent,
  ExpandIcon,
  SubNavList,
  ComingSoonBadge,
};

