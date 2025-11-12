import styled from "styled-components";

const BodyContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  flex: 1;
  width: 100%;
  transition: width 0.3s ease;
  overflow: auto;
  background-color: #f8f9fa;
`;

export { BodyContainer, ContentContainer };

