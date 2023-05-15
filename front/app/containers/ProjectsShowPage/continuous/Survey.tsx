import React from 'react';

// components
import ContentContainer from 'components/ContentContainer';
import Survey from '../shared/survey';
import { ScreenReaderOnly } from 'utils/a11y';
import { maxPageWidth } from 'containers/ProjectsShowPage/styles';
import SectionContainer from 'components/SectionContainer';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { IProjectData } from 'api/projects/types';

const Container = styled.div``;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

interface Props {
  project: IProjectData;
  className?: string;
}

const SurveyContainer = ({ project, className }: Props) => {
  const { formatMessage } = useIntl();

  if (
    project.attributes.survey_embed_url &&
    project.attributes.survey_service
  ) {
    return (
      <Container
        className={`e2e-continuous-project-survey-container ${className || ''}`}
      >
        <StyledContentContainer maxWidth={maxPageWidth}>
          <SectionContainer>
            <ScreenReaderOnly>
              <h2>{formatMessage(messages.invisibleTitleSurvey)}</h2>
            </ScreenReaderOnly>
            <Survey
              projectId={project.id}
              surveyService={project.attributes.survey_service}
              surveyEmbedUrl={project.attributes.survey_embed_url}
            />
          </SectionContainer>
        </StyledContentContainer>
      </Container>
    );
  }

  return null;
};

export default SurveyContainer;
