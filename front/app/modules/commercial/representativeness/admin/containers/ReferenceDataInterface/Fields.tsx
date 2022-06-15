import React from 'react';

// hooks
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// components
import { Box } from '@citizenlab/cl2-component-library';
import Field from '../../components/Field';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import { IUserCustomFieldData } from 'modules/commercial/user_custom_fields/services/userCustomFields';

// TODO remove this when implemented
const noDomicile = (userCustomField: IUserCustomFieldData) =>
  userCustomField.attributes.code !== 'domicile';

const Fields = () => {
  const userCustomFields = useUserCustomFields({ inputTypes: ['select'] });
  if (isNilOrError(userCustomFields)) return null;

  return (
    <Box mt="32px">
      {userCustomFields.filter(noDomicile).map(({ id, attributes }) => (
        <Field
          fieldId={id}
          isDefault={attributes.code !== null}
          titleMultiloc={attributes.title_multiloc}
          key={id}
        />
      ))}
    </Box>
  );
};

export default Fields;
