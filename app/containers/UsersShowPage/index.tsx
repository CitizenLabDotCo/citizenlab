import * as React from 'react';
import { isEmpty } from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';

// components
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import Avatar from 'components/Avatar';

// services
import { userBySlugStream, IUser } from 'services/users';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const StyledContentContainer = styled(ContentContainer)`
  padding-top: 40px;
  padding-bottom: 100px;
  background: #f9f9fa;

  ${media.phone`
    padding-top: 0px;
  `}
`;

const UserAvatar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const StyledAvatar = styled(Avatar)`
  width: 160px;
  height: 160px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 0px;
  padding-bottom: 40px;
  border-radius: 5px;
`;

const FullName = styled.div`
  width: 100%;
  padding-top: 0px;
  font-size: 29px;
  font-weight: 500;
  text-align: center;
  color: #333;
`;

const JoinedAt = styled.div`
  width: 100%;
  margin-top: 15px;
  font-size: 18px;
  font-weight: 400;
  text-align: center;
  color: #7e7e7e;
`;

const Bio = styled.div`
  max-width: 600px;
  margin: 23px auto;
  font-size: 20px;
  font-weight: 300;
  line-height: 1.25;
  text-align: center;
  color: #6b6b6b;
`;

const UserIdeas = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

type Props = {};

type Params = {
  params: {
    slug: string;
  }
};

type State = {
  user: IUser | null;
};

export default class UsersShowPage extends React.PureComponent<Props & Params, State> {
  
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      user: null
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const { slug } = this.props.params;
    const user$ = userBySlugStream(slug).observable;

    this.subscriptions = [
      user$.subscribe(user => this.setState({ user }))
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { user } = this.state;

    if (user) {
      const memberSince = moment(user.data.attributes.created_at).format('LL');

      return (
        <StyledContentContainer>

          <UserAvatar>
            <StyledAvatar userId={user.data.id} size="large" />
          </UserAvatar>

          <UserInfo>
            <FullName>{user.data.attributes.first_name} {user.data.attributes.last_name}</FullName>
            <JoinedAt>
              <FormattedMessage {...messages.memberSince} values={{ date: memberSince }} />
            </JoinedAt>
            {!isEmpty(user.data.attributes.bio_multiloc) &&
              <Bio>
                {user.data.attributes.bio_multiloc && <T value={user.data.attributes.bio_multiloc} />}
              </Bio>
            }
          </UserInfo>

          <UserIdeas>
            <IdeaCards queryParameters={{ author: user.data.id }} />
          </UserIdeas>

        </StyledContentContainer>
      );
    }

    return null;
  }
}
