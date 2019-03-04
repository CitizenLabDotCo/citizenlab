// Libraries
import React, { PureComponent } from 'react';
import { Subscription } from 'rxjs';

// services
import { IdeaActivity } from 'services/ideas';
import { userByIdStream, IUser } from 'services/users';

// Components
import UserName from 'components/UI/UserName';
import Avatar from 'components/Avatar';

// i18n
import { FormattedTime, FormattedDate } from 'react-intl';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const ChangeLogEntry = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const AvatarWrapper = styled.div`
  flex: 0 0 2rem;
  height: 2rem;
  margin-right: 1rem;
`;

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;

  p {
    font-size: ${fontSizes.base}px;
    font-weight: 400;
    margin: 0;

    &:last-child {
      color: ${colors.label};
      font-size: ${fontSizes.small}px
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

export default class ActivityChangeLog extends PureComponent<Props, State> {
  subs: Subscription[] = [];

  constructor(props) {
    super(props);

    this.state = {
      user: null,
    };
  }

  componentDidMount() {
    this.subs.push(userByIdStream(this.props.activity.relationships.user.data.id).observable.subscribe((response) => {
      this.setState({ user: response });
    }));
  }

  componentWillUnmount() {
    this.subs.forEach(sub => sub.unsubscribe());
  }

  render() {
    const { user } = this.state;

    return (
      <ChangeLogEntry>
        <AvatarWrapper>
          <Avatar userId={this.props.activity.relationships.user.data.id as string} size="30px" />
        </AvatarWrapper>
        <TextWrapper>
          <p>
            <FormattedMessage
              {...messages.changeLogEntry}
              values={{
                userName: <UserName user={(user ? user.data : null)} />,
                changeType: this.props.activity.attributes.action,
              }}
            />
          </p>
          <p>
            <FormattedDate
              value={this.props.activity.attributes.acted_at}
              year="numeric"
              month="2-digit"
              day="2-digit"
            />
            &nbsp;
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
