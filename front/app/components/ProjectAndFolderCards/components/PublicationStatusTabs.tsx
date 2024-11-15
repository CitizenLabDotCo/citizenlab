import React from 'react';

import { IAdminPublicationData } from 'api/admin_publications/types';

import { TLayout, PublicationTab } from '..';

import ProjectsTabPanel from './ProjectsTabPanel';

export type TCardSize = 'small' | 'medium' | 'large';

export interface BaseProps {
  currentTab: PublicationTab;
  list: IAdminPublicationData[];
  layout: TLayout;
  hasMore: boolean;
}

interface Props extends BaseProps {
  availableTabs: PublicationTab[];
}

const PublicationStatusTabs = ({
  currentTab,
  availableTabs,
  list,
  layout,
  hasMore,
}: Props) => {
  return (
    <>
      {/*
        We are rendering all three tab panels here even, though
        the tabs are hidden if they're not the currently selected
        tab. This is to make the tab system work well for screen readers.
        See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
      */}
      {availableTabs.map((tab) => (
        <ProjectsTabPanel
          key={tab}
          currentTab={currentTab}
          tab={tab}
          list={list}
          layout={layout}
          hasMore={hasMore}
          hasMoreThanOneTab={!!availableTabs.length}
        />
      ))}
    </>
  );
};

export default PublicationStatusTabs;
