import React from 'react';

// hooks
import useUserCustomFields from 'modules/commercial/user_custom_fields/hooks/useUserCustomFields';

// components
import Field from '../../components/Field';

// utils
import { isNilOrError } from 'utils/helperUtils';

const Fields = () => {
  const userCustomFields = useUserCustomFields({ inputTypes: ['select'] });
  if (isNilOrError(userCustomFields)) return null;

  return (
    <>
      {userCustomFields.map((userCustomField) => (
        <Field
          enabled={true}
          titleMultiloc={userCustomField.attributes.title_multiloc}
          key={userCustomField.id}
        />
      ))}
    </>
  );
};

export default Fields;
