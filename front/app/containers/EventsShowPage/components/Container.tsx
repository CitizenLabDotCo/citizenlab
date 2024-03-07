import React from 'react';

import styled from 'styled-components';

import { pageContentMaxWidth } from '../styleConstants';

const Main = styled.main`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  background: #fff;
  gap: 40px;
`;

interface Props {
  children: React.ReactNode;
}

const Container = ({ children }: Props) => {
  return <Main>{children}</Main>;
};

export default Container;
