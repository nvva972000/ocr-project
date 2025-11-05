import styled from "styled-components";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  height: 48px;
  background-color: #1A3636;
  border-bottom: 1px solid #000000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 100;
  position: relative;
`;
const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  color: #172B4D;
  position: relative;

  svg {
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
      color: #ffffff;
    }
  }
`;


const LogoHeader = styled.div`
  width: 300px;
  box-sizing: border-box;
  height: 48px;
  background-color: transparent;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 16px;
  color: #ffffff;
`;
const GlobalSearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  outline: none;
  color: #ffffff;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  height: 32px;
  position: relative;
  overflow: hidden;
  background: transparent;
  & > * {
    position: relative;
    z-index: 1;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(110deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
    transform: translateX(-100%);
    transition: transform 0s;
  }

  &:focus {
    outline: none;
    border: none;
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.3);
  }

  &:hover {
    border: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    
    &::before {
      transform: translateX(100%);
      transition: transform 3s cubic-bezier(0.23, 1, 0.32, 1);
    }
  }

  span {
    font-size: 13px;
    font-weight: 500;
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const KeyboardShortcut = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-size: 10px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;

  span:first-child {
    opacity: 0.9;
  }

  span:last-child {
    font-weight: 500;
  }
`;
const UserInfo = styled.div`
  border-bottom: 1px solid #DFE1E6;
  display: flex;
  align-items: center;
  height: 48px;
  padding: 0 16px;
  justify-content: end;
  gap: 16px;
`;

const UserGroup = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  gap: 19px;
`;

const UserAvatar = styled.img`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
`;
export { HeaderContainer, HeaderContent, LogoHeader, GlobalSearchButton, KeyboardShortcut, UserInfo, UserGroup, UserAvatar };

