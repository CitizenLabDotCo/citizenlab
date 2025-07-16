import React, { useRef, KeyboardEvent } from 'react';

import { fontSizes, colors, media } from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import HorizontalScroll from 'components/HorizontalScroll';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

const Tab = styled.button<{ active: boolean; fullWidth: boolean }>`
  box-sizing: content-box;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ fullWidth }) => (fullWidth ? 'center' : 'flex-start')};
  font-size: ${fontSizes.l}px;
  padding: 21px 15px;
  white-space: nowrap;
  flex: ${({ fullWidth }) => (fullWidth ? 1 : 'unset')};

  border-bottom: ${({ active, theme }) =>
    active
      ? `3px solid ${theme.colors.tenantPrimary}`
      : '3px solid transparent'};

  color: ${({ active, theme }) =>
    active ? theme.colors.tenantPrimary : colors.textSecondary};

  ${({ active, theme }) =>
    active
      ? ''
      : `
      &:hover {
        border-bottom: 3px solid ${rgba(theme.colors.tenantPrimary, 0.3)};
      }
      cursor: pointer;
    `}

  ${media.phone`
    font-size: ${fontSizes.base}px;
    padding: 14px 9px 14px;
  `}
`;

const CountText = styled.span`
  margin-left: 5px;

  ${media.phone`
    margin-left: 3px;
  `}
`;

export type TabData = {
  [key: string]: {
    label: MessageDescriptor;
    count?: number;
  };
};

interface Props<ShowCount extends boolean> {
  currentTab: string;
  availableTabs: string[];
  tabData: TabData;
  onChangeTab: (tab: string) => void;
  getTabId?: (tab: string) => string;
  getTabPanelId?: (tab: string) => string;
  getScreenReaderTextForTab?: (tab: string, count?: number) => JSX.Element;
  showCount: ShowCount;
  fullWidth?: boolean;
}

export const getDefaultTabId = (tab: string) => `tab-${tab}`;
export const getDefaultTabPanelId = (tab: string) => `tab-panel-${tab}`;

const Tabs = <ShowCount extends boolean>({
  currentTab,
  availableTabs,
  onChangeTab,
  tabData,
  getScreenReaderTextForTab,
  getTabId = getDefaultTabId,
  getTabPanelId = getDefaultTabPanelId,
  showCount,
  fullWidth = false,
}: Props<ShowCount>) => {
  const tabsRef = useRef({});

  const handleClickTab = (tab: string) => () => {
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
    <HorizontalScroll containerRole="tablist">
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
          fullWidth={fullWidth}
          key={tab}
          onClick={handleClickTab(tab)}
          onKeyDown={handleKeyDownTab}
          ref={(el) => el && (tabsRef.current[tab] = el)}
        >
          <div aria-hidden>
            <FormattedMessage {...tabData[tab].label} />
            {showCount && typeof tabData[tab].count === 'number' && (
              <CountText>({tabData[tab].count})</CountText>
            )}
          </div>

          {getScreenReaderTextForTab && (
            <ScreenReaderOnly>
              {/* TODO: Fix this the next time the file is edited. */}
              {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
              {getScreenReaderTextForTab(tab, tabData[tab]?.count)}
            </ScreenReaderOnly>
          )}
        </Tab>
      ))}
    </HorizontalScroll>
  );
};

export default Tabs;

function getSelectedTab(
  currentTab: string,
  availableTabs: string[],
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
