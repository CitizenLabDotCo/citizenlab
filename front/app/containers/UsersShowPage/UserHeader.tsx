import React from 'react';

import { isEmpty, forOwn } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import moment from 'moment';

// components
import Avatar from 'components/Avatar';
import QuillEditedContent from 'components/UI/QuillEditedContent';
import Button from 'components/UI/Button';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useAuthUser from 'hooks/useAuthUser';
import useUser from 'hooks/useUser';
import {
  useBreakpoint,
  Box,
  Title,
  Text,
} from '@citizenlab/cl2-component-library';

const Bio = styled.div`
  line-height: 1.25;
  max-width: 600px;
  text-align: center;
  font-weight: 400;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
`;

interface Props {
  userSlug: string | null;
}

const UserHeader = ({ userSlug }: Props) => {
  const authUser = useAuthUser();
  const user = useUser({ slug: userSlug });
  const isTablet = useBreakpoint('tablet');
  const hideBio = useFeatureFlag({ name: 'disable_user_bios' });

  if (!isNilOrError(user)) {
    const memberSinceMoment = moment(user.attributes.created_at).format('LL');
    let hasDescription = false;

    forOwn(user.attributes.bio_multiloc, (value, _key) => {
      if (!isEmpty(value) && value !== '<p></p>' && value !== '<p><br></p>') {
        hasDescription = true;
      }
    });

    return (
      <Box
        bgColor="white"
        width="100%"
        p={isTablet ? '20px 20px 35px' : '30px 0px 70px'}
      >
        <Box w="100%" display="flex" justifyContent="center" mb="40px">
          <Avatar userId={user.id} size={isTablet ? 120 : 150} />
        </Box>

        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          w="100%"
          mt="0px"
        >
          <Title id="e2e-usersshowpage-fullname" color="tenantText">
            {user.attributes.first_name} {user.attributes.last_name}
          </Title>
          <Text color="tenantText">
            <FormattedMessage
              {...messages.memberSince}
              values={{ date: memberSinceMoment }}
            />
          </Text>
          {!hideBio &&
            !isEmpty(user.attributes.bio_multiloc) &&
            hasDescription && (
              <Bio>
                <QuillEditedContent>
                  {user.attributes.bio_multiloc && (
                    <T
                      value={user.attributes.bio_multiloc}
                      supportHtml={true}
                    />
                  )}
                </QuillEditedContent>
              </Bio>
            )}
          {!isNilOrError(authUser) && authUser.id === user.id && (
            <Button
              linkTo="/profile/edit"
              buttonStyle="text"
              icon="edit"
              className="e2e-edit-profile"
              bgHoverColor={colors.background}
            >
              <FormattedMessage {...messages.editProfile} />
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return null;
};

export default UserHeader;
