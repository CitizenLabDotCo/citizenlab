import React from 'react';
import styled from 'styled-components';

// components
import ProjectCard from 'components/ProjectCard';
import Outlet from 'components/Outlet';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { BaseProps, TCardSize } from './ProjectsList';
import { PublicationTab } from '../';

// utils
import { getTabId, getTabPanelId } from './Topbar/Tabs';

const Container = styled.div`
  display: flex;
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
  cardSizes: TCardSize[];
}

const ProjectsTabPanel = ({
  tab,
  currentTab,
  list,
  layout,
  cardSizes,
  hasMore,
}: Props) => {
  return (
    <Container
      id={getTabPanelId(currentTab)}
      role="tabpanel"
      tabIndex={0}
      aria-labelledby={getTabId(currentTab)}
      hidden={tab !== currentTab}
    >
      {tab === currentTab && (
        <>
          {list.map((item: IAdminPublicationContent, index: number) => {
            const projectOrFolderId = item.publicationId;
            const projectOrFolderType = item.publicationType;
            const size =
              layout === 'dynamic'
                ? cardSizes[index]
                : layout === 'threecolumns'
                ? 'small'
                : 'medium';

            return (
              <React.Fragment key={index}>
                {projectOrFolderType === 'project' && (
                  <ProjectCard
                    projectId={projectOrFolderId}
                    size={size}
                    layout={layout}
                  />
                )}
                <Outlet
                  id="app.components.ProjectAndFolderCards.card"
                  publication={item}
                  size={size}
                  layout={layout}
                />
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
            (list.length + 1) % 3 === 0 && (
              <MockProjectCard className={layout} />
            )}

          {!hasMore &&
            (layout === 'threecolumns' || list.length > 6) &&
            (list.length - 1) % 3 === 0 && (
              <>
                <MockProjectCard className={layout} />
                <MockProjectCard className={layout} />
              </>
            )}
        </>
      )}
    </Container>
  );
};

export default ProjectsTabPanel;
