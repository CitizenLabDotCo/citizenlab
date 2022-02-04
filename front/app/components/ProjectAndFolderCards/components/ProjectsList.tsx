import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// components
import ProjectCard from 'components/ProjectCard';
import Outlet from 'components/Outlet';

// hooks
import { useWindowSize } from '@citizenlab/cl2-component-library';

// types
import { IAdminPublicationContent } from 'hooks/useAdminPublications';
import { TLayout } from '../';

// utils
import getCardSizes from './getCardSizes';
import { isEqual } from 'lodash-es';

export type TCardSize = 'small' | 'medium' | 'large';

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
  hasMore: boolean;
}

const ProjectsList = ({ list, layout, hasMore }: Props) => {
  const { windowWidth } = useWindowSize();

  const [cardSizes, setCardSizes] = useState<TCardSize[]>([]);

  useEffect(() => {
    if (list.length > 0 && layout === 'dynamic') {
      const newCardSizes = getCardSizes(list.length, windowWidth);

      if (!isEqual(cardSizes, newCardSizes)) {
        setCardSizes(newCardSizes);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, layout]);

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
