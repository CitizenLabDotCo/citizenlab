import React from 'react';

import { Box, colors, Title } from '@citizenlab/cl2-component-library';
import { UserComponent } from '@craftjs/core';
import styled from 'styled-components';

import { Multiloc } from 'typings';

import useAdminPublications from 'api/admin_publications/useAdminPublications';

import { useLocalize } from 'hooks/useLocalize';

import ProjectTimelineContainer from 'containers/ProjectsShowPage/timeline';

import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import Settings from './Settings';

const StyledSectionContainer = styled(SectionContainer)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: ${colors.background};
`;

const TimelineWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  margin-top: 20px;
`;

interface Props {
  titleMultiloc?: Multiloc;
  folderId: string;
}

const FolderTimeline: UserComponent<Props> = ({ titleMultiloc, folderId }) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const { data, isLoading } = useAdminPublications({
    pageSize: 12,
    publicationStatusFilter: ['published'],
    childrenOfId: folderId,
    removeNotAllowedParents: true,
    include_publications: true,
  });

  const adminPublications = data?.pages.map((page) => page.data).flat();

  // Filter to only show projects (not folders)
  const projects = adminPublications?.filter(
    (pub) => pub.relationships.publication.data.type === 'project'
  );

  const getTitle = () => {
    if (titleMultiloc) {
      return localize(titleMultiloc);
    }
    return formatMessage(messages.defaultTitle);
  };

  if (isLoading) {
    return (
      <StyledSectionContainer>
        <ContentContainer>
          <Title variant="h2" color="tenantText">
            {getTitle()}
          </Title>
          <Box mt="20px">Loading...</Box>
        </ContentContainer>
      </StyledSectionContainer>
    );
  }

  if (!projects || projects.length === 0) {
    return null;
  }

  return (
    <StyledSectionContainer className="e2e-folder-timeline">
      <ContentContainer>
        <Title variant="h2" color="tenantText" mb="20px">
          {getTitle()}
        </Title>
        <TimelineWrapper>
          {projects.map((publication) => (
            <ProjectTimelineContainer
              key={publication.id}
              projectId={publication.relationships.publication.data.id}
            />
          ))}
        </TimelineWrapper>
      </ContentContainer>
    </StyledSectionContainer>
  );
};

FolderTimeline.craft = {
  related: {
    settings: Settings,
  },
  custom: {
    title: messages.title,
  },
};

export default FolderTimeline;
