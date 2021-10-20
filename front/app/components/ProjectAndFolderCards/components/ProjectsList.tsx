import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// components
import ProjectCard from 'components/ProjectCard';
import Outlet from 'components/Outlet';

// hooks
import useAdminPublications from 'hooks/useAdminPublicationPrefetchProjects';
import useWindowSize from 'hooks/useWindowSize';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { TCardSize, TLayout } from '../';
import { PublicationStatus } from 'services/projects';

// utils
import getCardSizes from '../getCardSizes';
import { isNilOrError } from 'utils/helperUtils';
import { isEqual } from 'lodash-es';

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

interface Props {
  list: IAdminPublicationContent[];
  layout: TLayout;
  publicationStatusFilter: PublicationStatus[];
  hasMore: boolean;
}

const ProjectsList = ({
  list,
  layout,
  publicationStatusFilter,
  hasMore,
}: Props) => {
  const adminPublications = useAdminPublications({
    pageSize: 6,
    publicationStatusFilter,
    rootLevelOnly: true,
    removeNotAllowedParents: true,
  });

  const { windowWidth } = useWindowSize();

  const [cardSizes, setCardSizes] = useState<TCardSize[]>([]);

  useEffect(() => {
    if (
      !isNilOrError(adminPublications) &&
      adminPublications.list &&
      adminPublications.list.length > 0 &&
      windowWidth &&
      layout === 'dynamic'
    ) {
      const newCardSizes = getCardSizes(adminPublications, windowWidth);

      if (!isEqual(cardSizes, newCardSizes)) {
        setCardSizes(newCardSizes);
      }
    }
  }, [windowWidth, adminPublications, adminPublications.list, layout]);

  return (
    <Container id="e2e-projects-list">
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
       // A bit of a hack (but the most elegant one I could think of) to
       // make the 3-column layout work for the last row of project cards when
       // the total amount of projects is not divisible by 3 and therefore doesn't take up the full row width.
       // Ideally would have been solved with CSS grid, but... IE11
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

export default ProjectsList;
