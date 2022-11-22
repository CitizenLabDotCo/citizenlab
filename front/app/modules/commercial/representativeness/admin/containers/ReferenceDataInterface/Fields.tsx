import React from 'react';

// hooks
import useUserCustomFields from 'components/UserCustomFields/hooks/useUserCustomFields';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Field from '../../components/Field';
import Warning from 'components/UI/Warning';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isShown, isSupported } from '../Dashboard/utils';

const Fields = () => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });
  if (isNilOrError(userCustomFields)) return null;

  const supportedUserCustomFields = userCustomFields.filter(isSupported);

  return (
    <Box mt="32px">
      {supportedUserCustomFields.length === 0 && (
        <Box mt="40px" mb="48px">
          <Warning>
            <FormattedMessage {...messages.noEnabledFieldsSupported} />
          </Warning>
        </Box>
      )}

      {userCustomFields.filter(isShown).map(({ id }) => (
        <Field userCustomFieldId={id} key={id} />
      ))}
    </Box>
  );
};

export default Fields;
