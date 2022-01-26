import React, { useMemo } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl, colors, media } from 'utils/styleUtils';
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

const Tab = styled.button<{ active: boolean }>`
  box-sizing: content-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-size: ${fontSizes.large}px;
  padding: 0px 15px;

  border-bottom: ${({ active, theme }) =>
    active ? `3px solid ${theme.colorMain}` : '3px solid transparent'};

  color: ${({ active, theme }) => (active ? theme.colorMain : colors.label)};

  ${({ active, theme }) =>
    active
      ? ''
      : `
      &:hover {
        border-bottom: 3px solid ${rgba(theme.colorMain, 0.3)};
      }
      cursor: pointer;
    `}

  ${media.smallerThanMinTablet`
    font-size: ${fontSizes.base}px;
    padding: 0px 9px 14px;
  `}
`;

const StatusCount = styled.span`
  margin-left: 5px;

  ${media.smallerThanMinTablet`
    margin-left: 3px;
  `}
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
          data-testid="tab"
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
