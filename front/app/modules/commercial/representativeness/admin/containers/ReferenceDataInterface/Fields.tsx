import React from 'react';

// hooks
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Field from '../../components/Field';
import Warning from 'components/UI/Warning';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isShown, isSupported } from '../Dashboard/utils';

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
