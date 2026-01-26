import React from 'react';

import { IStatusCountsAll } from 'api/admin_publications_status_counts/types';

import FilterTabs, { TabData } from 'components/UI/FilterTabs';

import { FormattedMessage } from 'utils/cl-intl';

import { PublicationTab } from '../..';

import messages from './messages';

interface Props {
  currentTab: PublicationTab;
  statusCounts: IStatusCountsAll;
  availableTabs: PublicationTab[];
  onChangeTab: (tab: PublicationTab) => void;
}

export const getTabId = (tab: PublicationTab) => `project-cards-tab-${tab}`;
export const getTabPanelId = (tab: PublicationTab) =>
  `project-cards-tab-panel-${tab}`;

const PublicationFilterTabs = ({
  currentTab,
  statusCounts,
  availableTabs,
  onChangeTab,
}: Props) => {
  const tabData: TabData = {
    published: {
      label: messages.published,
      count: statusCounts.published || 0,
    },
    archived: {
      label: messages.archived,
      count: statusCounts.archived || 0,
    },
    draft: {
      label: messages.draft,
      count: statusCounts.draft || 0,
    },
    all: {
      label: messages.all,
      count: statusCounts.all || 0,
    },
  };

  const getScreenReaderTextForTab = (tab: string, count: number) => (
    <>
      <FormattedMessage {...tabData[tab].label} />
      {', '}
      <FormattedMessage
        {...messages.a11y_projectFilterTabInfo}
        values={{
          count,
        }}
      />
    </>
  );

  return (
    <FilterTabs
      currentTab={currentTab}
      availableTabs={availableTabs}
      onChangeTab={onChangeTab}
      tabData={tabData}
      getTabId={getTabId}
      getTabPanelId={getTabPanelId}
      getScreenReaderTextForTab={getScreenReaderTextForTab}
      showCount
    />
  );
};

export default PublicationFilterTabs;
