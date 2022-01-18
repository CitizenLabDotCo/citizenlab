import React from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div``;

const Tab = styled.div`
  border-bottom: 3px solid #ce4040;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

interface Props {
  activeTab: string;
}

const Tabs = ({ activeTab }: Props) => {
  return (
    <TabsContainer>
      <Tab>{activeTab}</Tab>
    </TabsContainer>
  );
};

export default Tabs;
