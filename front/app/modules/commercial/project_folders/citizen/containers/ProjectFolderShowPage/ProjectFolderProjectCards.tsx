import React from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import ProjectCard from 'components/ProjectCard';

// hooks
import useWindowSize from 'hooks/useWindowSize';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// typins
import useAdminPublications from 'hooks/useAdminPublications';
import { PublicationStatus } from 'services/projects';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const StyledProjectCard = styled(ProjectCard)<{ isEven: boolean }>`
  flex-grow: 0;
  width: calc(100% * (1 / 2) - 10px);
  margin: 0px;
  margin-right: ${(props) => (props.isEven ? '20px' : '0px')};
  margin-bottom: 20px;

  &.oneCardPerRow {
    width: 100%;
    margin-right: 0px;
  }

  ${media.smallerThanMinTablet`
    width: 100%;
    margin: 0;
    margin-bottom: 20px;
  `};
`;

interface Props {
  folderId: string;
}

const publicationStatuses: PublicationStatus[] = ['published', 'archived'];

const ProjectFolderProjectCards = ({ folderId }: Props) => {
  const { windowWidth } = useWindowSize();
  const { list: adminPublications } = useAdminPublications({
    childrenOfId: folderId,
    publicationStatusFilter: publicationStatuses,
  });

  if (!isNilOrError(adminPublications)) {
    const filteredList = adminPublications.filter(
      (item) => item.publicationType === 'project'
    );
    const hasNoDescriptionPreviews = filteredList?.every((item) =>
      isEmpty(item.attributes.publication_description_preview_multiloc)
    );
    const hideDescriptionPreview = hasNoDescriptionPreviews;

    if (filteredList && filteredList?.length > 0) {
      return (
        <Container
          className={
            adminPublications.filter(
              (item) => item.publicationType === 'project'
            ).length === 1 ||
            (windowWidth > 1000 && windowWidth < 1350)
              ? 'oneCardPerRow'
              : '' || ''
          }
        >
          {filteredList.map((item, index) => (
            <StyledProjectCard
              key={item.publicationId}
              projectId={item.publicationId}
              size="small"
              isEven={index % 2 !== 1}
              hideDescriptionPreview={hideDescriptionPreview}
              className={
                filteredList.length === 1 ||
                (windowWidth > 1000 && windowWidth < 1350)
                  ? 'oneCardPerRow'
                  : ''
              }
            />
          ))}
        </Container>
      );
    }
  }

  return null;
};

export default ProjectFolderProjectCards;
