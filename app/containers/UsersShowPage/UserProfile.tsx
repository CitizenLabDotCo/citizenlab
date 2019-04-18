import React, { memo } from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';

// components
import Avatar from 'components/Avatar';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// resources
import GetUser, { GetUserChildProps } from 'resources/GetUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import Button from 'components/UI/Button';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { adopt } from 'react-adopt';
import Link from 'utils/cl-router/Link';
import Icon from 'components/UI/Icon';

const Container = styled.div`
  background-color: white;
  width: 100%;
  padding-top: 40px;
  padding-bottom: 70px;
`;

const UserAvatar = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 0px;
  font-size: ${fontSizes.base}px;
`;

const FullName = styled.div`
  width: 100%;
  padding-top: 0px;
  font-size: ${fontSizes.xl}px;
  font-weight: 500;
  text-align: center;
  color: #333;
`;

const JoinedAt = styled.div`
  width: 100%;
  margin-top: 15px;
  font-weight: 300;
  text-align: center;
  color: ${colors.clGreyOnGreyBackground};
`;

const Bio = styled.div`
  line-height: 1.25;
  max-width: 600px;
  text-align: center;
  font-weight: 400;
  margin: 23px auto;
`;

const EditProfile = styled(Link)`

`;

interface InputProps {
  userSlug: string | null;
}

interface DataProps {
  user: GetUserChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

const UsersProfile = memo<Props>(props => {
    const { user, authUser } = props;

    if (!isNilOrError(user)) {
      const memberSinceMoment = moment(user.attributes.created_at).format('LL');
      return (
        <Container>
          <UserAvatar>
            <Avatar userId={user.id} size="100px" />
          </UserAvatar>

          <UserInfo>
            <FullName id="e2e-usersshowpage-fullname">{user.attributes.first_name} {user.attributes.last_name}</FullName>
            <JoinedAt>
              <FormattedMessage {...messages.memberSince} values={{ date: memberSinceMoment }} />
            </JoinedAt>
            {!isEmpty(user.attributes.bio_multiloc) &&
              <Bio>
                <QuillEditedContent>
                  {user.attributes.bio_multiloc && <T value={user.attributes.bio_multiloc} supportHtml={true} />}
                </QuillEditedContent>
              </Bio>
            }
            {!isNilOrError(authUser) && authUser.id === user.id &&
              <EditProfile to="/profile/edit">
                <Icon name="pen" />
                <FormattedMessage {...messages.editProfile} />
              </EditProfile>
            }
          </UserInfo>
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
    authUser: <GetAuthUser />,
    user: ({ userSlug, render }) => <GetUser slug={userSlug}>{render}</GetUser>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UsersProfile {...inputProps} {...dataProps} />}
  </Data>
);
