import React, { useMemo } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';

import LargeProjectCard from 'components/ProjectCard/LargeProjectCard';
import MediumProjectCard from 'components/ProjectCard/MediumProjectCard';
import SmallProjectCard from 'components/ProjectCard/SmallProjectCard';

import { PublicationTab } from '../';

import getCardSizes from './getCardSizes';
import ProjectFolderCard from './ProjectFolderCard';
import { BaseProps, TCardSize } from './PublicationStatusTabs';
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
  const isLargerThanTablet = !isSmallerThanTablet;

  const cardSizes = useMemo(() => {
    if (list.length > 0 && layout === 'dynamic') {
      return getCardSizes(list.length, isLargerThanTablet);
    }

    return [];
  }, [list.length, layout, isLargerThanTablet]);

  const renderProjectCard = (
    size: TCardSize,
    projectId: string,
    key: number
  ) => {
    switch (size) {
      case 'large':
        return (
          <FullWidthCard key={key}>
            <LargeProjectCard projectId={projectId} />
          </FullWidthCard>
        );
      case 'medium':
        return (
          <TwoColumnCard key={key}>
            <MediumProjectCard projectId={projectId} />
          </TwoColumnCard>
        );
      case 'small':
        return (
          <ThreeColumnCard key={key}>
            <SmallProjectCard projectId={projectId} />
          </ThreeColumnCard>
        );
      default:
        return null;
    }
  };

  const getCardSize = (index: number) => {
    if (layout === 'dynamic') {
      return cardSizes[index];
    } else if (layout === 'threecolumns') {
      return 'small';
    } else {
      return 'medium';
    }
  };

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
        const size = getCardSize(index);

        if (projectOrFolderType === 'project') {
          return renderProjectCard(size, projectOrFolderId, index);
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
