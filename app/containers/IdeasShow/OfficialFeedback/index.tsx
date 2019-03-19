import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import OfficialFeedbackNew from './Form/OfficialFeedbackNew';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// resources
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';

// styling
import styled from 'styled-components';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';

const StyledOfficialFeedbackNew = styled(OfficialFeedbackNew)`
  margin-bottom: 70px;
`;

interface InputProps {
  ideaId: string;
}

interface DataProps {
  idea: GetIdeaChildProps;
  project: GetProjectChildProps;
  permission: GetPermissionChildProps;
}

interface Props extends InputProps, DataProps {
  className?: string;
}

interface State {
}

export class OfficialFeedback extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { ideaId, permission, className } = this.props;

    return (
      <div className={className}>
        {permission &&
          <StyledOfficialFeedbackNew ideaId={ideaId} />
        }

        <OfficialFeedbackFeed
          ideaId={ideaId}
          editingAllowed={permission}
        />
      </div>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  project: ({ idea, render }) => !isNilOrError(idea) ? <GetProject id={idea.relationships.project.data.id} >{render}</GetProject> : null,
  permission: ({ project, render }) => !isNilOrError(project) ? <GetPermission item={project} action="moderate" >{render}</GetPermission> : null,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedback {...inputProps} {...dataProps} />}
  </Data>
);
