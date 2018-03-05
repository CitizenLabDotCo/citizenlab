import * as React from 'react';
import { WithRouterProps } from 'react-router';
import styled from 'styled-components';

import GetProject from 'utils/resourceLoaders/components/GetProject';
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import Survey from '../process/survey';

const SurveyContent = styled(ContentContainer)`
  margin: 70px 0;
  min-height: 500px;
`;


type Props = {};
type State = {};

export default class ProjectSurvey extends React.Component<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <GetProject slug={this.props.params.slug}>
        {({ project }) => (
          <>
            {project && <>
              <Header slug={this.props.params.slug} />
              <SurveyContent>
                <Survey surveyService={project.attributes.survey_service} surveyEmbedUrl={project.attributes.survey_embed_url} />
              </SurveyContent>
            </>}
          </>
        )}
      </GetProject>
    );
  }
}
