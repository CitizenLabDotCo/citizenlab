import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isEmpty, forOwn } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';

// components
import Avatar from 'components/Avatar';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Button from 'components/UI/Button';

// resources
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetUser, { GetUserChildProps } from 'resources/GetUser';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, media, viewportWidths } from 'utils/styleUtils';

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

const FullName = styled.h1`
  width: 100%;
  font-size: ${fontSizes.xl}px;
  font-weight: 600;
  text-align: center;
  color: ${({ theme }) => theme.colorText};
  padding: 0px;
  margin: 0px;
  margin-bottom: 5px;
`;

const JoinedAt = styled.div`
  width: 100%;
  font-weight: 300;
  text-align: center;
  color: ${({ theme }) => theme.colorText};
  margin-bottom: 20px;
`;

const Bio = styled.div`
  line-height: 1.25;
  max-width: 600px;
  text-align: center;
  font-weight: 400;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
`;

const EditProfileButton = styled(Button)``;

interface InputProps {
  userSlug: string | null;
}

interface DataProps {
  windowSize: GetWindowSizeChildProps;
  user: GetUserChildProps;
  authUser: GetAuthUserChildProps;
}

interface Props extends InputProps, DataProps {}

export const UserHeader = memo<Props>((props) => {
  const { user, authUser, windowSize } = props;
  const smallerThanSmallTablet = windowSize
    ? windowSize <= viewportWidths.smallTablet
    : false;

  if (!isNilOrError(user)) {
    const memberSinceMoment = moment(user.attributes.created_at).format('LL');
    let hasDescription = false;

    forOwn(user.attributes.bio_multiloc, (value, _key) => {
      if (!isEmpty(value) && value !== '<p></p>' && value !== '<p><br></p>') {
        hasDescription = true;
      }
    });

    return (
      <Container>
        <UserAvatar>
          <Avatar userId={user.id} size={smallerThanSmallTablet ? 120 : 150} />
        </UserAvatar>

        <UserInfo>
          <FullName id="e2e-usersshowpage-fullname">
            {user.attributes.first_name} {user.attributes.last_name}
          </FullName>
          <JoinedAt>
            <FormattedMessage
              {...messages.memberSince}
              values={{ date: memberSinceMoment }}
            />
          </JoinedAt>
          {!isEmpty(user.attributes.bio_multiloc) && hasDescription && (
            <Bio>
              <QuillEditedContent>
                {user.attributes.bio_multiloc && (
                  <T value={user.attributes.bio_multiloc} supportHtml={true} />
                )}
              </QuillEditedContent>
            </Bio>
          )}
          {!isNilOrError(authUser) && authUser.id === user.id && (
            <EditProfileButton
              linkTo="/profile/edit"
              buttonStyle="text"
              icon="pencil"
              iconAriaHidden
              className="e2e-edit-profile"
              bgHoverColor={colors.background}
            >
              <FormattedMessage {...messages.editProfile} />
            </EditProfileButton>
          )}
        </UserInfo>
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
  authUser: <GetAuthUser />,
  user: ({ userSlug, render }) => <GetUser slug={userSlug}>{render}</GetUser>,
});

const WrappedUserHeader = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <UserHeader {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedUserHeader;
