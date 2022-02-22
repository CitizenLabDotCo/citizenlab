import React, { useRef, KeyboardEvent } from 'react';

// components
import { ScreenReaderOnly } from 'utils/a11y';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl, colors, media } from 'utils/styleUtils';
import { rgba } from 'polished';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { IStatusCounts } from 'hooks/useAdminPublicationsStatusCounts';
import { PublicationTab } from '../..';
import { MessageDescriptor } from 'typings';

const TabsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;

  ${media.largePhone`
    width: 100%;
    justify-content: space-between;
  `}

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
  padding: 21px 15px;

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
    padding: 14px 9px 14px;
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
  availableTabs: PublicationTab[];
  onChangeTab: (tab: PublicationTab) => void;
}

export const getTabId = (tab: PublicationTab) => `project-cards-tab-${tab}`;
export const getTabPanelId = (tab: PublicationTab) =>
  `project-cards-tab-panel-${tab}`;

const MESSAGES_MAP: Record<PublicationTab, MessageDescriptor> = {
  published: messages.published,
  archived: messages.archived,
  draft: messages.draft,
  all: messages.all,
};

const Tabs = ({
  currentTab,
  statusCounts,
  availableTabs,
  onChangeTab,
}: Props) => {
  const tabsRef = useRef({});

  const handleClickTab = (tab: PublicationTab) => () => {
    if (currentTab === tab) return;
    onChangeTab(tab);
  };

  const handleKeyDownTab = ({ key }: KeyboardEvent<HTMLButtonElement>) => {
    if (key !== 'ArrowLeft' && key !== 'ArrowRight') return;

    const selectedTab = getSelectedTab(currentTab, availableTabs, key);
    onChangeTab(selectedTab);
    tabsRef.current[selectedTab].focus();
  };

  return (
    <TabsContainer role="tablist">
      {/* 
        These tabs need the role, aria-selected etc to work well with
        screen readers.
        See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
      */}
      {availableTabs.map((tab) => (
        <Tab
          id={getTabId(tab)}
          data-testid="tab"
          role="tab"
          aria-selected={currentTab === tab}
          tabIndex={currentTab === tab ? 0 : -1}
          aria-controls={getTabPanelId(tab)}
          active={currentTab === tab}
          key={tab}
          onClick={handleClickTab(tab)}
          onKeyDown={handleKeyDownTab}
          ref={(el) => el && (tabsRef.current[tab] = el)}
        >
          <div aria-hidden>
            <FormattedMessage {...MESSAGES_MAP[tab]} />
            <StatusCount>({statusCounts[tab]})</StatusCount>
          </div>

          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.a11y_projectFilterTabInfo}
              values={{
                tab: <FormattedMessage {...MESSAGES_MAP[tab]} />,
                count: statusCounts[tab],
              }}
            />
          </ScreenReaderOnly>
        </Tab>
      ))}
    </TabsContainer>
  );
};

export default Tabs;

function getSelectedTab(
  currentTab: PublicationTab,
  availableTabs: PublicationTab[],
  key: 'ArrowLeft' | 'ArrowRight'
) {
  const currentTabIndex = availableTabs.indexOf(currentTab);

  const selectedTabIndex =
    key === 'ArrowLeft'
      ? currentTabIndex === 0
        ? availableTabs.length - 1
        : currentTabIndex - 1
      : currentTabIndex === availableTabs.length - 1
      ? 0
      : currentTabIndex + 1;

  return availableTabs[selectedTabIndex];
}
