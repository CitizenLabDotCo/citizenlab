import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import OfficialFeedbackNew from './Form/OfficialFeedbackNew';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// resources
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';

// style
import styled from 'styled-components';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

const Container = styled.div``;

interface InputProps {
  ideaId: string;
  className?: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
  permission: GetPermissionChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
}

interface Props extends InputProps, DataProps {
  className?: string;
}

interface State {}

export class OfficialFeedback extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { ideaId, permission, officialFeedbacks, className } = this.props;

    if (permission || (!isNilOrError(officialFeedbacks) && !isNilOrError(officialFeedbacks.officialFeedbacksList) && officialFeedbacks.officialFeedbacksList.data.length > 0)) {
      return (
        <Container className={className}>
          {permission &&
            <OfficialFeedbackNew ideaId={ideaId} />
          }

          <OfficialFeedbackFeed
            ideaId={ideaId}
            permission={permission}
            editingAllowed={permission}
          />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => !isNilOrError(idea) ? <GetProject id={idea.relationships.project.data.id} >{render}</GetProject> : null,
  permission: ({ project, render }) => !isNilOrError(project) ? <GetPermission item={project} action="moderate" >{render}</GetPermission> : null,
  officialFeedbacks: ({ ideaId, render }) => <GetOfficialFeedbacks ideaId={ideaId}>{render}</GetOfficialFeedbacks>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedback {...inputProps} {...dataProps} />}
  </Data>
);
