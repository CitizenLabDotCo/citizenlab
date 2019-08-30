import React, { memo } from 'react';
import { isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';

// components
import Avatar from 'components/Avatar';
import QuillEditedContent from 'components/UI/QuillEditedContent';

// resources
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media, viewportWidths } from 'utils/styleUtils';
import { adopt } from 'react-adopt';
import Link from 'utils/cl-router/Link';
import Icon from 'components/UI/Icon';
import { darken } from 'polished';

const Container = styled.div`
  background-color: white;
  width: 100%;
  padding-top: 30px;
  padding-bottom: 70px;

  ${media.smallerThanMaxTablet`
    padding: 20px 20px 35px;
  `}
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
  font-weight: 600;
  text-align: center;
  color:  ${({ theme }) => theme.colorText};
`;

const JoinedAt = styled.div`
  width: 100%;
  margin-top: 10px;
  font-weight: 300;
  text-align: center;
  color:  ${({ theme }) => theme.colorText};
`;

const Bio = styled.div`
  line-height: 1.25;
  max-width: 600px;
  text-align: center;
  font-weight: 400;
  margin: 18px auto;
`;

const EditProfile = styled(Link)`
  margin-top: 10px;
  padding: 6px 10px;
  color: ${colors.label};
  border-radius: ${({ theme }) => theme.borderRadius};
  display: flex;
  align-items: center;
  transition: all 100ms ease-out;

  &:hover,
  &:focus {
    color: ${darken(0.2, colors.label)};
    background: ${colors.background};
  }
`;

const EditIcon = styled(Icon)`
  margin-right: 8px;
`;

interface InputProps {
  userSlug: string | null;
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
  user: GetUserChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

export const UserHeader = memo<Props>(props => {
    const { user, authUser, windowSize } = props;
    const smallerThanSmallTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;

    if (!isNilOrError(user)) {
      const memberSinceMoment = moment(user.attributes.created_at).format('LL');

      return (
        <Container>
          <UserAvatar>
            <Avatar userId={user.id} size={smallerThanSmallTablet ? '120px' : '150px'} />
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
                <EditIcon name="pencil" />
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
  windowSize: <GetWindowSize />,
  authUser: <GetAuthUser />,
  user: ({ userSlug, render }) => <GetUser slug={userSlug}>{render}</GetUser>
});

const WrappedUserHeader = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <UserHeader {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserHeader;
