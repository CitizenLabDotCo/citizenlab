import * as React from 'react';
import { WithRouterProps } from 'react-router';
import styled from 'styled-components';

import GetProject from 'utils/resourceLoaders/components/GetProject';
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import Survey from '../process/survey';
import Spinner from 'components/UI/Spinner';
import { IProjectData } from 'services/projects';

const SurveyContainer = styled.div`
  min-height: 500px;
  padding: 70px 0 90px 0;
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
      <React.Fragment>
        <Header slug={this.props.params.slug} />
        <ContentContainer>
          <SurveyContainer>
            <GetProject slug={this.props.params.slug}>
              {({ project }: {project: IProjectData}) => (<>
                {project
                  ? <Survey surveyService={project.attributes.survey_service} surveyEmbedUrl={project.attributes.survey_embed_url} />
                  : <Spinner />
                }
              </>)}
            </GetProject>
          </SurveyContainer>
        </ContentContainer>
      </React.Fragment>
    );
  }
}
