import React, { useMemo } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// typings
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from '../../';

// utils
import { getAvailableTabs } from './utils';

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
