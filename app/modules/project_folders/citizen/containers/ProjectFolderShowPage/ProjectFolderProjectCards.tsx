import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useAdminPublicationPrefetchProjects from 'hooks/useAdminPublicationPrefetchProjects';

// components
import ProjectCard from 'components/ProjectCard';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

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
  margin-right: ${(props) => (props.isEven ? '20px' : '0px')};

  ${media.smallerThanMinTablet`
    width: 100%;
    margin: 0;
  `};
`;

const ProjectFolderProjectCards = memo<{
  projectFolderId: string;
  className?: string;
}>(({ projectFolderId, className }) => {
  const adminPublication = useAdminPublicationPrefetchProjects({
    folderId: projectFolderId,
    publicationStatusFilter: ['published', 'archived'],
  });

  const list = !isNilOrError(adminPublication)
    ? adminPublication?.list?.filter(
        (item) => item.publicationType === 'project'
      )
    : null;

  if (list && list.length > 0) {
    return (
      <Container className={className || ''}>
        {list.map((item, index) => (
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
