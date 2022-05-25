import React from 'react';

// hooks
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Field from '../../components/Field';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Fields = () => {
  const userCustomFields = useUserCustomFields({ inputTypes: ['select'] });
  if (isNilOrError(userCustomFields)) return null;

  const noop = () => {};

  return (
    <Box mt="32px">
      {userCustomFields.map((userCustomField) => (
        <Field
          enabled={true}
          titleMultiloc={userCustomField.attributes.title_multiloc}
          key={userCustomField.id}
          onToggleEnabled={noop}
        />
      ))}
    </Box>
  );
};

export default Fields;
