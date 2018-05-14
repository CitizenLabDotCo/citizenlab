// Libraries
import React from 'react';

// Services & Resources
import { IProjectData } from 'services/projects';
import { isProjectModerator } from 'services/permissions/roles';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// Components
import Icon from 'components/UI/Icon';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { rgba } from 'polished';

const ModeratorInfo = styled.p`
  align-items: center;
  background: ${rgba(colors.draftYellow, .1)};
  border-radius: 5px;
  color: ${colors.draftYellow};
  display: flex;
  justify-content: center;
  margin: .5rem auto 1rem auto;
  padding: 1rem;

  svg {
    width: 1.5rem;
    margin: 0 1rem;
  }
`;

// Typings
export interface InputProps {
  projectId: IProjectData['id'];
  displayType?: 'icon' | 'message';
  className?: string;
}
interface DataProps {
  user: GetAuthUserChildProps;
}

export interface State {}

export class ProjectModIndicator extends React.PureComponent<InputProps & DataProps, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { user, projectId, displayType, className } = this.props;

    if (user && projectId && isProjectModerator({ data: user }, projectId)) {
      let component;

      switch (displayType) {
        case 'message':
          component = (
            <ModeratorInfo className={className}>
              <Icon name="shield" />
              <FormattedMessage {...messages.projectModeratorIndicator} />
            </ModeratorInfo>
          );
          break;

        case 'icon':
        default:
          component = (
            <Icon name="shield" className={className} title={<FormattedMessage {...messages.projectModeratorIndicator} />} />
          );
          break;
      }

      return component;
    }

    return null;
  }
}

export default (props: InputProps) => (
  <GetAuthUser {...props}>
    {user => <ProjectModIndicator user={user} {...props}/>}
  </GetAuthUser>
);
