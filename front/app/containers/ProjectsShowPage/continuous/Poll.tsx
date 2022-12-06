import React, { memo } from 'react';
// i18n
import { WrappedComponentProps } from 'react-intl';
// hooks
import useProject from 'hooks/useProject';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { colors } from 'utils/styleUtils';
import messages from 'containers/ProjectsShowPage/messages';
import {
  ProjectPageSectionTitle,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';
// components
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
// styling
import styled from 'styled-components';
import Poll from '../shared/poll';

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
    const project = useProject({ projectId });

    if (
      !isNilOrError(project) &&
      project.attributes.process_type === 'continuous' &&
      project.attributes.participation_method === 'poll'
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
              <Poll type="project" projectId={project.id} phaseId={null} />
            </SectionContainer>
          </StyledContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(PollContainer);
