import React from 'react';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { Select } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';

const AuthorFilters = () => {
  const localize = useLocalize();
  const { data: customFields } = useUserCustomFields();
  const genderField = customFields?.data.find(
    (field) => field.attributes.code === 'gender'
  );

  const { data: genderOptions } = useUserCustomFieldsOptions(genderField?.id);

  console.log(genderOptions);
  return (
    <div>
      {genderOptions && (
        <Select
          id="gender"
          label="Gender"
          options={genderOptions.data.map((option) => ({
            label: localize(option.attributes.title_multiloc),
            value: option.attributes.key,
          }))}
          onChange={(value) => console.log(value)}
        />
      )}
    </div>
  );
};

export default AuthorFilters;
