import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import styled from 'styled-components';

import useAdminPublications from 'api/admin_publications/useAdminPublications';
import { PublicationStatus } from 'api/projects/types';

import ProjectCard from 'components/ProjectCard';

import { isNilOrError } from 'utils/helperUtils';

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
  ${media.phone`
    width: 100%;
    margin: 0;
    margin-bottom: 20px;
  `};
`;

interface Props {
  className?: string;
  folderId: string;
}

const publicationStatuses: PublicationStatus[] = ['published', 'archived'];

const ProjectFolderProjectCards = ({ folderId, className }: Props) => {
  const { data } = useAdminPublications({
    childrenOfId: folderId,
    publicationStatusFilter: publicationStatuses,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();

  if (!isNilOrError(adminPublications)) {
    const hasNoDescriptionPreviews = adminPublications.every((item) =>
      isEmpty(item.attributes.publication_description_preview_multiloc)
    );
    const hideDescriptionPreview = hasNoDescriptionPreviews;

    if (adminPublications && adminPublications.length > 0) {
      return (
        <Container className={className}>
          {adminPublications.map((item, index) => (
            <StyledProjectCard
              key={item.id}
              projectId={item.relationships.publication.data.id}
              size="small"
              isEven={index % 2 !== 1}
              hideDescriptionPreview={hideDescriptionPreview}
              className={adminPublications.length === 1 ? 'oneCardPerRow' : ''}
            />
          ))}
        </Container>
      );
    }
  }

  return null;
};

export default ProjectFolderProjectCards;
