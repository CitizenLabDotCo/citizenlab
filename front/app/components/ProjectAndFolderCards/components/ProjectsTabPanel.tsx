import React from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';

import LargeProjectCard from 'components/ProjectCard/LargeProjectCard';
import MediumProjectCard from 'components/ProjectCard/MediumProjectCard';
import SmallProjectCard from 'components/ProjectCard/SmallProjectCard';

import { PublicationTab } from '../';

import { getCardSize } from './getCardSize';
import ProjectFolderCard from './ProjectFolderCard';
import { BaseProps } from './PublicationStatusTabs';
import { getTabId, getTabPanelId } from './Topbar/Tabs';

const Container = styled.ul<{ hide: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'grid')};
  grid-template-columns: repeat(12, 1fr);
  gap: 20px;
  width: 100%;
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const FullWidthCard = styled.li`
  grid-column: span 12;
  display: flex;
  flex-direction: column;
`;

const TwoColumnCard = styled.li`
  grid-column: span 6;
  display: flex;
  flex-direction: column;
`;

const ThreeColumnCard = styled.li`
  grid-column: span 4;
  display: flex;
  flex-direction: column;
`;

interface Props extends BaseProps {
  tab: PublicationTab;
}

const ProjectsTabPanel = ({ tab, currentTab, list, layout }: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');

  return (
    <Container
      id={getTabPanelId(tab)}
      role="tabpanel"
      className={`e2e-projects-list ${tab === currentTab ? 'active-tab' : ''}`}
      tabIndex={0}
      aria-labelledby={getTabId(tab)}
      hidden={tab !== currentTab}
      hide={tab !== currentTab}
    >
      {list.map((item: IAdminPublicationData, index: number) => {
        const projectOrFolderId = item.relationships.publication.data.id;
        const projectOrFolderType = item.relationships.publication.data.type;

        const size = getCardSize({
          listLength: list.length,
          index,
          isSmallerThanTablet,
          layout,
        });

        if (projectOrFolderType === 'project') {
          const projectId = projectOrFolderId;

          switch (size) {
            case 'large':
              return (
                <FullWidthCard key={projectId}>
                  <LargeProjectCard projectId={projectId} />
                </FullWidthCard>
              );
            case 'medium':
              return (
                <TwoColumnCard key={projectId}>
                  <MediumProjectCard projectId={projectId} />
                </TwoColumnCard>
              );
            case 'small':
              return (
                <ThreeColumnCard key={projectId}>
                  <SmallProjectCard projectId={projectId} />
                </ThreeColumnCard>
              );
            default:
              return null;
          }
        }

        if (projectOrFolderType === 'folder') {
          return (
            <ThreeColumnCard key={projectOrFolderId}>
              <ProjectFolderCard
                folderId={projectOrFolderId}
                size={size}
                layout={layout}
              />
            </ThreeColumnCard>
          );
        }

        return null;
      })}
    </Container>
  );
};

export default ProjectsTabPanel;
