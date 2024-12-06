import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';

import ProjectCard from 'components/ProjectCard';

import { PublicationTab } from '../..';
import ProjectFolderCard from '../ProjectFolderCard';
import { BaseProps } from '../PublicationStatusTabs';
import { getTabId, getTabPanelId } from '../Topbar/Tabs';

const Container = styled.div<{ hide: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'block')};
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 24px;
  ${media.phone`
    grid-template-columns: auto;  
  `}
`;

interface Props extends Omit<BaseProps, 'layout'> {
  tab: PublicationTab;
  hasMoreThanOneTab: boolean;
}

const ThreeColumnLayout = ({
  tab,
  currentTab,
  list,
  hasMoreThanOneTab,
}: Props) => {
  return (
    // The id, aria-labelledby, hidden and hide are necessary
    // for the tab system to work well with screen readers.
    // See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
    <Container
      id={getTabPanelId(tab)}
      role={hasMoreThanOneTab ? 'tabpanel' : undefined}
      className={`e2e-projects-list ${tab === currentTab ? 'active-tab' : ''}`}
      aria-labelledby={hasMoreThanOneTab ? `${getTabId(tab)}` : undefined}
      hidden={tab !== currentTab}
      hide={tab !== currentTab}
    >
      <GridContainer>
        {list.map((item: IAdminPublicationData, index: number) => {
          const projectOrFolderId = item.relationships.publication.data.id;
          const projectOrFolderType = item.relationships.publication.data.type;

          if (projectOrFolderType === 'project') {
            return (
              <ProjectCard
                key={index}
                projectId={projectOrFolderId}
                size="small"
                layout="threecolumns"
              />
            );
          }

          return (
            <ProjectFolderCard
              key={index}
              folderId={projectOrFolderId}
              size="small"
              layout="threecolumns"
            />
          );
        })}
      </GridContainer>
    </Container>
  );
};

export default ThreeColumnLayout;
