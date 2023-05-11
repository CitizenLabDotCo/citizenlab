import React, { memo } from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import Survey from '../shared/survey';
import { ScreenReaderOnly } from 'utils/a11y';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';

// hooks
import useProjectById from 'api/projects/useProjectById';

// i18n
import { WrappedComponentProps } from 'react-intl';
import injectIntl from 'utils/cl-intl/injectIntl';
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

const SurveyContainer = memo<Props & WrappedComponentProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const { data: project } = useProjectById(projectId);

    if (
      project &&
      project.data.attributes.process_type === 'continuous' &&
      project.data.attributes.participation_method === 'survey' &&
      project.data.attributes.survey_embed_url &&
      project.data.attributes.survey_service
    ) {
      return (
        <Container
          className={`e2e-continuous-project-survey-container ${
            className || ''
          }`}
        >
          <StyledContentContainer maxWidth={maxPageWidth}>
            <SectionContainer>
              <ScreenReaderOnly>
                <h2>{formatMessage(messages.invisibleTitleSurvey)}</h2>
              </ScreenReaderOnly>
              <Survey
                projectId={project.data.id}
                surveyService={project.data.attributes.survey_service}
                surveyEmbedUrl={project.data.attributes.survey_embed_url}
              />
            </SectionContainer>
          </StyledContentContainer>
        </Container>
      );
    }

    return null;
  }
);

export default injectIntl(SurveyContainer);
