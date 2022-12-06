import React from 'react';
// components
import { Box } from '@citizenlab/cl2-component-library';
// hooks
import useUserCustomFields from 'hooks/useUserCustomFields';
import { isShown, isSupported } from '../Dashboard/utils';
import { FormattedMessage } from 'utils/cl-intl';
// utils
import { isNilOrError } from 'utils/helperUtils';
import Field from '../../components/Field';
import Warning from 'components/UI/Warning';
// i18n
import messages from './messages';

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
