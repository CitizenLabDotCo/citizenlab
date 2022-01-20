import React from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { PublicationTab } from 'services/adminPublications';

const Tab = styled.div`
  border-bottom: 3px solid #ce4040;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.large}px;
  color: #ce4040;
`;

interface Props {
  currentTab: PublicationTab;
  availableTabs: PublicationTab[];
  onChangeTab: (tab: PublicationTab) => void;
}

const Tabs = ({ currentTab }: Props) => {
  return <Tab>{currentTab}</Tab>;
};

export default Tabs;
