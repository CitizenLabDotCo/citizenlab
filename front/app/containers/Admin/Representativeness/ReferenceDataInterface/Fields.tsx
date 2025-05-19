import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import Field from 'components/admin/Representativeness/Field';
import Warning from 'components/UI/Warning';

import { FormattedMessage } from 'utils/cl-intl';

import { isShown, isSupported } from '../Dashboard/utils';

import messages from './messages';

const Fields = () => {
  const { data: userCustomFields } = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });
  if (!userCustomFields) return null;

  const supportedUserCustomFields = userCustomFields.data.filter(isSupported);

  return (
    <Box mt="32px">
      {supportedUserCustomFields.length === 0 && (
        <Box mt="40px" mb="48px">
          <Warning>
            <FormattedMessage {...messages.noEnabledFieldsSupported} />
          </Warning>
        </Box>
      )}

      {userCustomFields.data.filter(isShown).map(({ id }) => (
        <Field userCustomFieldId={id} key={id} />
      ))}
    </Box>
  );
};

export default Fields;
