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
import GetOfficialFeedbacks, { GetOfficialFeedbacksChildProps } from 'resources/GetOfficialFeedbacks';

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
  margin-bottom: 70px;
`;

interface InputProps {
  ideaId: string;
  project: IProject | null;
}

interface DataProps {
  permission: GetPermissionChildProps;
  officialFeedbacks: GetOfficialFeedbacksChildProps;
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
    const { officialFeedbacks } = this.props;
    const { officialFeedbacksList } = officialFeedbacks;
    const updateDate = !isNilOrError(officialFeedbacksList)
      && officialFeedbacksList.data
      && officialFeedbacksList.data.length > 0
      && (officialFeedbacksList.data[0].attributes.updated_at || officialFeedbacksList.data[0].attributes.created_at);

    return (
      <>
        {permission &&
          <StyledOfficialFeedbackNew ideaId={ideaId} />
        }

        {updateDate &&
          <FeedbackHeader>
            <FeedbackTitle>
              <FormattedMessage {...messages.officialUpdates} />
            </FeedbackTitle>
              <FormattedMessage
                {...messages.lastUpdate}
                values={{ lastUpdateDate: (<StyledSpan><FormattedDate value={updateDate} /></StyledSpan>) }}
              />
          </FeedbackHeader>
        }

        <OfficialFeedbackFeed
          ideaId={ideaId}
          editingAllowed={permission}
          officialFeedbacks={officialFeedbacks}
        />
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  permission: ({ project, render }) => !isNilOrError(project) ? <GetPermission item={project.data} action="moderate" >{render}</GetPermission> : null,
  officialFeedbacks: ({ ideaId, render }) => <GetOfficialFeedbacks ideaId={ideaId}>{render}</GetOfficialFeedbacks>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <OfficialFeedback {...inputProps} {...dataProps} />}
  </Data>
);
