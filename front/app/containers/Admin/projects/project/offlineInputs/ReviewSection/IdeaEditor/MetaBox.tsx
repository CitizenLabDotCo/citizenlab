import React from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Locale } from 'typings';
import { IUser } from 'api/users/types';

interface Props {
  phaseName?: string;
  locale?: Locale;
  author: IUser;
}

const MetaBox = ({ phaseName, locale, author }: Props) => {
  // const firstName = author?.data.attributes.first_name;
  // const lastName = author?.data.attributes.last_name;
  // const email = author?.data.attributes.email;
  const { first_name, last_name, email } = author.data.attributes;

  return (
    <Box w="90%" borderBottom={`1px solid ${colors.borderLight}`} mb="20px">
      <Box
        w="100%"
        display="flex"
        borderBottom={`1px solid ${colors.borderLight}`}
        mb="20px"
      >
        <Box pr="12px">
          {phaseName && (
            <Text fontWeight="bold">
              <FormattedMessage {...messages.phase} />
            </Text>
          )}
          {locale && (
            <Text fontWeight="bold">
              <FormattedMessage {...messages.locale} />
            </Text>
          )}
        </Box>
        <Box>
          {phaseName && <Text>{phaseName}</Text>}
          {locale && <Text>{locale}</Text>}
        </Box>
      </Box>
      <Box mt="0px" mb="20px">
        <Box mb="12px">
          <Input type="email" label="Email" value={email} />
        </Box>
        <Box mb="12px">
          <Input type="text" label="First name" value={first_name} />
        </Box>
        <Input type="text" label="Last name" value={last_name} />
      </Box>
    </Box>
  );
};

export default MetaBox;
