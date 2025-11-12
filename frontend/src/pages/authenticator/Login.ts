import styled from 'styled-components';

const LoginContainer = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 20px;
`;

const Logo = styled.img`
  height: 60px;
  width: auto;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;

export { LoginContainer, Logo };
