// Libraries
import * as React from 'react';
import { Subscription } from 'rxjs';

// services
import { IdeaActivity } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';

// Components
import UserName from 'components/UI/UserName';
import Avatar from 'components/Avatar';

// i18n
import { FormattedRelative, FormattedTime } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { color, fontSize } from 'utils/styleUtils';

const ChangeLogEntry = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const AvatarWrapper = styled.div`
  flex: 0 0 2rem;
  margin-right: 1rem;

  svg {
    width: 100%;
  }
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;

  p {
    font-size: ${fontSize('base')};
    font-weight: 400;
    margin: 0;

    &:last-child {
      color: ${color('label')};
      font-size: ${fontSize('small')}
    }
  }
`;

// Typing
interface Props {
  activity: IdeaActivity;
}

interface State {
  user: IUser | null;
}

export default class ActivityChangeLog extends React.Component<Props, State> {
  subs: Subscription[] = [];

  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }
  componentWillMount() {
    this.subs.push(userByIdStream(this.props.activity.relationships.user.data.id).observable.subscribe((response) => {
      this.setState({ user: response });
    }));
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  render () {
    return (
      <ChangeLogEntry>
        <AvatarWrapper>
          <Avatar userId={this.props.activity.relationships.user.data.id as string} size="small" />
        </AvatarWrapper>
        <TextWrapper>
          <p>
            <FormattedMessage
              {...messages.changeLogEntry}
              values={{
                userName: <UserName user={this.state.user} />,
                changeType: this.props.activity.attributes.action,
              }}
            />
          </p>
          <p>
            <FormattedTime
              value={this.props.activity.attributes.acted_at}
              hour="2-digit"
              minute="2-digit"
            />
          </p>
        </TextWrapper>
      </ChangeLogEntry>
    );
  }
}
