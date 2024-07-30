import React, { useState, useEffect } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { isEqual } from 'lodash-es';
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

const MockProjectCard = styled.li<{ size: TCardSize }>`
  height: 1px;
  background: transparent;
  grid-column: ${({ size }) =>
    size === 'large' ? 'span 12' : size === 'medium' ? 'span 6' : 'span 4'};
`;

interface Props extends BaseProps {
  tab: PublicationTab;
}

const ProjectsTabPanel = ({
  tab,
  currentTab,
  list,
  layout,
  hasMore,
}: Props) => {
  const isSmallerThanTablet = useBreakpoint('tablet');
  const isLargerThanTablet = !isSmallerThanTablet;
  const [cardSizes, setCardSizes] = useState<TCardSize[]>([]);

  useEffect(() => {
    if (list.length > 0 && layout === 'dynamic') {
      const newCardSizes = getCardSizes(list.length, isLargerThanTablet);

      if (!isEqual(cardSizes, newCardSizes)) {
        setCardSizes(newCardSizes);
      }
    }
  }, [list.length, layout, cardSizes, isLargerThanTablet]);

  const renderProjectCard = (size: TCardSize, projectId: string) => {
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
          return renderProjectCard(size, projectOrFolderId);
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

      {!hasMore && layout === 'threecolumns' && list.length % 3 !== 0 && (
        <>
          {Array.from({ length: 3 - (list.length % 3) }).map((_, i) => (
            <MockProjectCard key={i} size="small" />
          ))}
        </>
      )}

      {!hasMore && layout !== 'threecolumns' && list.length % 2 !== 0 && (
        <MockProjectCard size="medium" />
      )}
    </Container>
  );
};

export default ProjectsTabPanel;
