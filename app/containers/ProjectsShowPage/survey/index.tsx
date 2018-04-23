import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import Survey from '../process/survey';

// resources
import GetProject from 'resources/GetProject';

// styling
import styled from 'styled-components';

const SurveyContainer = styled.div`
  padding-top: 70px;
  padding-bottom: 70px;
`;

export default withRouter((props: WithRouterProps) => (
  <GetProject slug={props.params.slug}>
    {project => (
        <>
          <Header projectSlug={props.params.slug} />
          <ContentContainer>
            <SurveyContainer>
              {project &&
                <Survey
                  surveyService={project.attributes.survey_service}
                  surveyEmbedUrl={project.attributes.survey_embed_url}
                />
              }
            </SurveyContainer>
          </ContentContainer>
        </>
    )}
  </GetProject>
));
