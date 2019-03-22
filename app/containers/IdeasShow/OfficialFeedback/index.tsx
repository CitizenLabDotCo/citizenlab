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
import { GetProjectChildProps } from 'resources/GetProject';

const StyledOfficialFeedbackNew = styled(OfficialFeedbackNew)`
  margin-bottom: 70px;
`;

interface InputProps {
  ideaId: string;
  project: GetProjectChildProps;
}

interface DataProps {
  permission: GetPermissionChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
}

export class OfficialFeedback extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { ideaId, permission } = this.props;

    return (
      <>
        {permission &&
          <StyledOfficialFeedbackNew ideaId={ideaId} />
        }

        <OfficialFeedbackFeed
          ideaId={ideaId}
          editingAllowed={permission}
        />
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  permission: ({ project, render }) => !isNilOrError(project) ? <GetPermission item={project} action="moderate" >{render}</GetPermission> : null,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedback {...inputProps} {...dataProps} />}
  </Data>
);
