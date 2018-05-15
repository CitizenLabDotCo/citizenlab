import React from 'react';
import { isEmpty } from 'lodash';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import * as moment from 'moment';

// components
import IdeaCards from 'components/IdeaCards';
import ContentContainer from 'components/ContentContainer';
import Avatar from 'components/Avatar';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

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

interface InputProps {}

interface DataProps {
  user: GetUserChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class UsersShowPage extends React.PureComponent<Props, State> {
  render() {
    const { user } = this.props;

    if (!isNilOrError(user)) {
      const memberSince = moment(user.attributes.created_at).format('LL');

      return (
        <StyledContentContainer>
          <UserAvatar>
            <StyledAvatar userId={user.id} size="large" />
          </UserAvatar>

          <UserInfo>
            <FullName>{user.attributes.first_name} {user.attributes.last_name}</FullName>
            <JoinedAt>
              <FormattedMessage {...messages.memberSince} values={{ date: memberSince }} />
            </JoinedAt>
            {!isEmpty(user.attributes.bio_multiloc) &&
              <Bio>
                {user.attributes.bio_multiloc && <T value={user.attributes.bio_multiloc} />}
              </Bio>
            }
          </UserInfo>

          <UserIdeas>
            <IdeaCards 
              type="load-more"
              sort="trending"
              pageSize={12}
              authorId={user.id}
            />
          </UserIdeas>
        </StyledContentContainer>
      );
    }

    return null;
  }
}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetUser slug={inputProps.params.slug}>
    {user => <UsersShowPage user={user} />}
  </GetUser>
));
