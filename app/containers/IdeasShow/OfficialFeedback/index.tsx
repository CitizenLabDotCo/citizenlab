import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// services
import { IProject } from 'services/projects';

// components
import OfficialFeedbackNew from './Form/OfficialFeedbackNew';
import OfficialFeedbackFeed from './OfficialFeedbackFeed';

// resources
import GetPermission, { GetPermissionChildProps } from 'resources/GetPermission';
import GetOfficialFeedback, { GetOfficialFeedbackChildProps } from 'resources/GetOfficialFeedback';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { FormattedDate } from 'react-intl';

const FeedbackHeader = styled.div`
  color: ${colors.clRed};
  margin-top: 50px;
  margin-bottom: 25px;
  display: flex;
  justify-content: space-between;
`;

const FeedbackTitle = styled.h4`
  margin-bottom: 0;
  font-weight: 500;
`;

const StyledSpan = styled.span`
  font-weight: 500;
`;

const StyledOfficialFeedbackNew = styled(OfficialFeedbackNew)`
  margin-bottom: 20px;
`;

interface InputProps {
  ideaId: string;
  project: IProject | null;
}

interface DataProps {
  permission: GetPermissionChildProps;
  officialFeedback: GetOfficialFeedbackChildProps;
}

interface Props extends InputProps, DataProps {}

// editingPost stores whether the form is visible and where it is currently shown
// (hidden, new, editing post with id...)
interface State {
  editingPost: string;
}

export class OfficialFeedback extends PureComponent<Props, State> {
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
    const { ideaId, permission, officialFeedback } = this.props;
    const { officialFeedbackList } = officialFeedback;
    const { editingPost } = this.state;
    const updateDate = !isNilOrError(officialFeedbackList)
      && officialFeedbackList.length > 0
      && (officialFeedbackList[0].attributes.updated_at || officialFeedbackList[0].attributes.created_at);

    return (
      <>
        {(updateDate || permission) &&
          <FeedbackHeader>
            <FeedbackTitle>
              <FormattedMessage {...messages.officialUpdate} />
            </FeedbackTitle>
            {updateDate &&
              <FormattedMessage
                {...messages.lastUpdate}
                values={{ lastUpdateDate: (<StyledSpan><FormattedDate value={updateDate} /></StyledSpan>) }}
              />
            }
          </FeedbackHeader>
        }

        {permission && editingPost === 'new' &&
          <StyledOfficialFeedbackNew ideaId={ideaId}/>
        }

        <OfficialFeedbackFeed
          ideaId={ideaId}
          showForm={this.switchForm}
          editingAllowed={permission}
          editingPost={editingPost}
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
