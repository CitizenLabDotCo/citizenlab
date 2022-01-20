import React, { useMemo } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// utils
import { keys } from 'utils/helperUtils';

// typings
import { IStatusCounts, PublicationTab } from 'services/adminPublications';

const Tab = styled.div<{ active: boolean }>`
  ${({ active }) => (active ? 'border-bottom: 3px solid #ce4040' : '')};
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.large}px;
  color: ${({ active }) => (active ? '#ce4040' : '')};
`;

interface Props {
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  onChangeTab: (tab: PublicationTab) => void;
}

const Tabs = ({ currentTab, statusCounts }: Props) => {
  const availableTabs = useMemo(() => {
    return getAvailableTabs(statusCounts);
  }, [statusCounts]);

  return (
    <>
      {availableTabs.map((tab) => (
        <Tab active={currentTab === tab} key={tab}>
          {tab} ({statusCounts[tab]})
        </Tab>
      ))}
    </>
  );
};

export default Tabs;

function getAvailableTabs(statusCounts: IStatusCounts): PublicationTab[] {
  if (statusCounts.all === 0) {
    return ['all'];
  }

  return keys(statusCounts).filter((tab) => statusCounts[tab] > 0);
}
