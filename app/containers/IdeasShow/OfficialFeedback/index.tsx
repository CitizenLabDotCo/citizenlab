import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import OfficialFeedbackNew from './Form/OfficialFeedbackNew';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// resources
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';
import { GetProjectChildProps } from 'resources/GetProject';

// style
import styled from 'styled-components';

const Container = styled.div``;

interface InputProps {
  ideaId: string;
  project: GetProjectChildProps;
  className?: string;
}

interface DataProps {
  permission: GetPermissionChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

export class OfficialFeedback extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { ideaId, permission, className } = this.props;

    return (
      <Container className={className}>
        {permission &&
          <OfficialFeedbackNew ideaId={ideaId} />
        }

        <OfficialFeedbackFeed
          ideaId={ideaId}
          editingAllowed={permission}
        />
      </Container>
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
