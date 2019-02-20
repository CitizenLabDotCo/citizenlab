import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IProject } from 'services/projects';

// components
import OfficialFeedbackNew from './Form/New';
import Feed from './Feed';
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';
import GetOfficialFeedback from 'resources/GetOfficialFeedback';
import { adopt } from 'react-adopt';

interface InputProps {
  ideaId: string;
  project: IProject | null;
}

interface DataProps {
  permission: GetPermissionChildProps;
}

interface Props extends InputProps, DataProps {}

// editingPost stores whether the form is visible and where it is currently shown
// (hidden, new, editing post with id...)
interface State {
  editingPost: string;
}

class OfficialFeedback extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      editingPost: 'new'
    };
  }

  switchForm = (showForm: string) => {
    this.setState({ editingPost: showForm });
  }

  render() {
    const { ideaId, permission } = this.props;
    const { editingPost } = this.state;
    console.log(editingPost);
    return (
      <>
        {permission && editingPost === 'new' &&
          <OfficialFeedbackNew ideaId={ideaId}/>
        }

        <Feed
          showForm={this.switchForm}
          editingAllowed={permission}
          editingPost={editingPost}
          ideaId={ideaId}
        />
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  permission: ({ project, render }) => !isNilOrError(project) ? <GetPermission item={project.data} action="moderate" >{render}</GetPermission> : null,
  officialFeedback: ({ ideaId, render }) => <GetOfficialFeedback ideaId={ideaId}>{render}</GetOfficialFeedback>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedback {...inputProps} {...dataProps} />}
  </Data>
);
