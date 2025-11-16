import styled from "styled-components";

export const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
  padding: 12px;
  box-sizing: border-box;
  gap: 16px;
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
  width: 100%;
  gap: 12px;
  position: sticky;
  top: 0;
  z-index: 2;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 6px;
  background-color: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

