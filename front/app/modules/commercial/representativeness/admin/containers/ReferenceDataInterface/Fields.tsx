import React from 'react';

// hooks
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Field from '../../components/Field';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { isShown, isSupported } from '../Dashboard/utils';

const Fields = () => {
  const userCustomFields = useUserCustomFields({
    inputTypes: ['select', 'number'],
  });
  if (isNilOrError(userCustomFields)) return null;

  return (
    <Box mt="32px">
      {userCustomFields.filter(isShown).map((userCustomField) => {
        const { id, attributes } = userCustomField;

        return (
          <Field
            userCustomFieldId={id}
            isDefault={attributes.code !== null}
            isComingSoon={!isSupported(userCustomField)}
            titleMultiloc={attributes.title_multiloc}
            key={id}
          />
        );
      })}
    </Box>
  );
};

export default Fields;
