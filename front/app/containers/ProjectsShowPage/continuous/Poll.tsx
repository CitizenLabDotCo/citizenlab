import React, { memo } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import Poll from '../shared/poll';
import { ScreenReaderOnly } from 'utils/a11y';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';

// hooks
import useProjectById from 'api/projects/useProjectById';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div``;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

interface Props {
  projectId: string;
  className?: string;
}

const PollContainer = memo<Props & WrappedComponentProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const { data: project } = useProjectById(projectId);

    if (
      project &&
      project.data.attributes.process_type === 'continuous' &&
      project.data.attributes.participation_method === 'poll'
    ) {
      return (
        <Container
          className={`e2e-continuous-project-poll-container ${className || ''}`}
        >
          <StyledContentContainer maxWidth={maxPageWidth}>
            <SectionContainer>
              <ProjectPageSectionTitle>
                <FormattedMessage {...messages.navPoll} />
              </ProjectPageSectionTitle>
              <ScreenReaderOnly>
                <h2>{formatMessage(messages.invisibleTitlePoll)}</h2>
              </ScreenReaderOnly>
              <Poll type="project" projectId={project.data.id} phaseId={null} />
            </SectionContainer>
          </StyledContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(PollContainer);
