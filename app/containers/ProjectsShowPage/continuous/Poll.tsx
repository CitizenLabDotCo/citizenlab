import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import Poll from '../shared/poll';
import { ScreenReaderOnly } from 'utils/a11y';
import { SectionContainer } from 'containers/ProjectsShowPage/styles';

// hooks
import useProject from 'hooks/useProject';

// i18n
import { InjectedIntlProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
`;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

interface Props {
  projectId: string;
  className?: string;
}

const PollContainer = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const project = useProject({ projectId });

    if (
      !isNilOrError(project) &&
      project.attributes.process_type === 'continuous' &&
      project.attributes.participation_method === 'poll'
    ) {
      return (
        <Container
          id="e2e-continuous-project-poll-container"
          className={className || ''}
        >
          <StyledContentContainer>
            <SectionContainer>
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
