import React, { useState, useEffect } from 'react';

import { useBreakpoint } from '@citizenlab/cl2-component-library';
import { isEqual } from 'lodash-es';
import styled from 'styled-components';

import { IAdminPublicationData } from 'api/admin_publications/types';

import ProjectCard from 'components/ProjectCard';

import { PublicationTab } from '../';

import getCardSizes from './getCardSizes';
import ProjectFolderCard from './ProjectFolderCard';
import { BaseProps, TCardSize } from './PublicationStatusTabs';
import { getTabId, getTabPanelId } from './Topbar/Tabs';

const Container = styled.div<{ hide: boolean }>`
  display: ${({ hide }) => (hide ? 'none' : 'flex')};
  flex-wrap: wrap;
  justify-content: space-between;
`;

const MockProjectCard = styled.div`
  height: 1px;
  background: transparent;
  width: calc(33% - 12px);
`;

interface Props extends BaseProps {
  tab: PublicationTab;
  hasMoreThanOneTab: boolean;
}

const ProjectsTabPanel = ({
  tab,
  currentTab,
  list,
  layout,
  hasMore,
  hasMoreThanOneTab,
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
      {list.map((item: IAdminPublicationData, index: number) => {
        const projectOrFolderId = item.relationships.publication.data.id;
        const projectOrFolderType = item.relationships.publication.data.type;
        const getCardSize = (index: number) => {
          if (layout === 'dynamic') {
            return cardSizes[index];
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          } else if (layout === 'threecolumns') {
            return 'small';
          } else {
            return 'medium';
          }
        };
        const size = getCardSize(index);

        return (
          <React.Fragment key={index}>
            {projectOrFolderType === 'project' && (
              <ProjectCard
                projectId={projectOrFolderId}
                size={size}
                layout={layout}
              />
            )}
            {projectOrFolderType === 'folder' && (
              <ProjectFolderCard
                folderId={projectOrFolderId}
                size={size}
                layout={layout}
              />
            )}
          </React.Fragment>
        );
      })}

      {/*
          A bit of a hack (but the most elegant one I could think of) to
          make the 3-column layout work for the last row of project cards when
          the total amount of projects is not divisible by 3 and therefore doesn't take up the full row width.
          Ideally would have been solved with CSS grid, but... IE11
        */}
      {!hasMore &&
        (layout === 'threecolumns' || list.length > 6) &&
        (list.length + 1) % 3 === 0 && <MockProjectCard className={layout} />}

      {!hasMore &&
        (layout === 'threecolumns' || list.length > 6) &&
        (list.length - 1) % 3 === 0 && (
          <>
            <MockProjectCard className={layout} />
            <MockProjectCard className={layout} />
          </>
        )}
    </Container>
  );
};

export default ProjectsTabPanel;
