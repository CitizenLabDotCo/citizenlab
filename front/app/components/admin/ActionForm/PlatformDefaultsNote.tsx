import React from 'react';

import { Text, TextProps } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

type Props = Pick<TextProps, 'as' | 'mt' | 'ml' | 'mb' | 'lineHeight'>;

const PlatformDefaultsNote = ({ as, mt, ml, mb, lineHeight }: Props) => {
  const { data: authUser } = useAuthUser();
  const userIsAdmin = isAdmin(authUser);

  return (
    <Text
      as={as}
      m="0"
      mt={mt}
      ml={ml}
      mb={mb}
      fontSize="xs"
      color="coolGrey600"
      lineHeight={lineHeight}
    >
      <FormattedMessage
        {...messages.usingPlatformDefaults}
        values={{
          link: (chunks) =>
            userIsAdmin ? (
              <Link to="/admin/settings/registration">{chunks}</Link>
            ) : (
              <>{chunks}</>
            ),
        }}
      />
    </Text>
  );
};

export default PlatformDefaultsNote;
