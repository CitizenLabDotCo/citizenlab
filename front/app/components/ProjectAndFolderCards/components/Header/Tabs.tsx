import React, { useMemo } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl, colors } from 'utils/styleUtils';
import { rgba } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from '../../';

// utils
import { getAvailableTabs } from './utils';

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Tab = styled.div<{ active: boolean }>`
  box-sizing: content-box;
  ${({ active, theme }) =>
    active ? `border-bottom: 3px solid ${theme.colorMain}` : ''};
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.large}px;
  color: ${({ active, theme }) => (active ? theme.colorMain : colors.label)};
  padding: 0px 15px;

  ${({ active, theme }) =>
    !active
      ? `
        border-bottom: 3px solid transparent;
        &:hover {
          border-bottom: 3px solid ${rgba(theme.colorMain, 0.3)};
        }
        cursor: pointer;
      `
      : ''}
`;

const StatusCount = styled.span`
  margin-left: 5px;
`;

interface Props {
  currentTab: PublicationTab;
  statusCounts: IStatusCounts;
  onChangeTab: (tab: PublicationTab) => void;
}

const Tabs = ({ currentTab, statusCounts, onChangeTab }: Props) => {
  const availableTabs = useMemo(() => {
    return getAvailableTabs(statusCounts);
  }, [statusCounts]);

  const handleClickTab = (tab: PublicationTab) => () => {
    if (currentTab === tab) return;
    onChangeTab(tab);
  };

  return (
    <TabsContainer>
      {availableTabs.map((tab) => (
        <Tab
          active={currentTab === tab}
          key={tab}
          onClick={handleClickTab(tab)}
        >
          <FormattedMessage {...messages[tab]} />
          <StatusCount>({statusCounts[tab]})</StatusCount>
        </Tab>
      ))}
    </TabsContainer>
  );
};

export default Tabs;
