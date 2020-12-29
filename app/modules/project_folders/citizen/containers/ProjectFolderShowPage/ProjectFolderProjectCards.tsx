import React, { memo } from 'react';

// components
import ProjectCard from 'components/ProjectCard';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typins
import { IAdminPublicationContent } from 'hooks/useAdminPublications';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${media.smallerThanMinTablet`
    margin: 0;
  `};
`;

const StyledProjectCard = styled(ProjectCard)<{ isEven: boolean }>`
  flex-grow: 0;
  width: calc(100% * (1 / 2) - 10px);
  margin: 0px;
  margin-right: ${(props) => (props.isEven ? '20px' : '0px')};

  ${media.smallerThan1200px`
    width: 100%;
    margin: 0;
    margin-bottom: 20px;
  `};
`;

const ProjectFolderProjectCards = memo<{
  list: IAdminPublicationContent[] | undefined | null;
  className?: string;
}>(({ list, className }) => {
  const filteredList = list?.filter(
    (item) => item.publicationType === 'project'
  );

  if (filteredList && filteredList?.length > 0) {
    return (
      <Container className={className || ''}>
        {filteredList.map((item, index) => (
          <StyledProjectCard
            key={item.publicationId}
            projectId={item.publicationId}
            size="small"
            isEven={index % 2 !== 1}
          />
        ))}
      </Container>
    );
  }

  return null;
});

export default ProjectFolderProjectCards;
