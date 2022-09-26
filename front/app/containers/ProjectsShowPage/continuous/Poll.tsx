import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import SectionContainer from 'components/SectionContainer';
import {
  maxPageWidth,
  ProjectPageSectionTitle,
} from 'containers/ProjectsShowPage/styles';
import { ScreenReaderOnly } from 'utils/a11y';
import Poll from '../shared/poll';

// hooks
import useProject from 'hooks/useProject';

// i18n
import messages from 'containers/ProjectsShowPage/messages';
import {
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';

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
