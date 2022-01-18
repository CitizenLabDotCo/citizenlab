import React from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Tab = styled.div`
  border-bottom: 3px solid #ce4040;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.large}px;
  color: #ce4040;
`;

interface Props {
  activeTab: string;
}

const Tabs = ({ activeTab }: Props) => {
  return <Tab>{activeTab}</Tab>;
};

export default Tabs;
