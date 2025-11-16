import React, { useState } from 'react';
import { HeaderContainer, HeaderContent, LogoHeader, UserAvatar, UserGroup, UserInfo } from './Header.styles';
import Logo from '../common/icon/Logo';
import { FaBars } from 'react-icons/fa';
import { logout } from '../../api/auth.api';

interface HeaderProps {
    onToggleSidebar?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <HeaderContainer>
            <LogoHeader>
                <Logo />
                <span style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.2, color: '#ffffff' }}>Optical Character Recognition - TC</span>
                <div
                    style={{
                        width: 30,
                        height: 30,
                        borderRadius: '8px',
                        backgroundColor: 'transparent',
                        border: '1px solid #bbbbbb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    }}
                    onClick={onToggleSidebar}
                >
                    <FaBars size={12} color='#ffffff' />
                </div>
            </LogoHeader>
            <HeaderContent>

            </HeaderContent>
            <UserInfo>
                <UserGroup>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'end', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.2, color: '#ffffff' }}>User</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <UserAvatar
                            src="https://i.pinimg.com/736x/cd/4b/d9/cd4bd9b0ea2807611ba3a67c331bff0b.jpg"
                            alt="User avatar"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setMenuOpen(!menuOpen)}
                        />
                        {menuOpen && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 40,
                                    right: 0,
                                    background: '#fff',
                                    border: '1px solid #DFE1E6',
                                    borderRadius: 8,
                                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                                    minWidth: 140,
                                    zIndex: 1000,
                                    padding: '8px 0'
                                }}
                            >
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '8px 16px',
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: 14
                                    }}
                                >
                                    Setting
                                </button>
                                <button
                                    style={{
                                        width: '100%',
                                        padding: '8px 16px',
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: 14,
                                        color: '#e74c3c'
                                    }}
                                    onMouseDown={async (e) => {
                                        e.preventDefault();
                                        try {
                                            await logout();
                                        } catch (error) {
                                            console.error('Logout error:', error);
                                        } finally {
                                            window.location.href = '/login';
                                        }
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </UserGroup>
            </UserInfo>
        </HeaderContainer>
    );
};

export default Header;
