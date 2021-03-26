import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import ContentContainer from 'components/ContentContainer';
import Survey from '../shared/survey';
import { ScreenReaderOnly } from 'utils/a11y';
import {
  SectionContainer,
  maxPageWidth,
} from 'containers/ProjectsShowPage/styles';

// hooks
import useProject from 'hooks/useProject';

// i18n
import { InjectedIntlProps } from 'react-intl';
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

const SurveyContainer = memo<Props & InjectedIntlProps>(
  ({ projectId, className, intl: { formatMessage } }) => {
    const project = useProject({ projectId });

    if (
      !isNilOrError(project) &&
      project.attributes.process_type === 'continuous' &&
      project.attributes.participation_method === 'survey' &&
      project.attributes.survey_embed_url &&
      project.attributes.survey_service
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
  }
);

export default injectIntl(SurveyContainer);
