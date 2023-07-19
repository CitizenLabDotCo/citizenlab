import React from 'react';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { Box, Select } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import MultipleSelect from 'components/UI/MultipleSelect';

const AuthorFilters = () => {
  const localize = useLocalize();
  const { data: customFields } = useUserCustomFields();

  const genderField = customFields?.data.find(
    (field) => field.attributes.code === 'gender'
  );

  const domicileField = customFields?.data.find(
    (field) => field.attributes.code === 'domicile'
  );

  const { data: genderOptions } = useUserCustomFieldsOptions(genderField?.id);
  const { data: domicileOptions } = useUserCustomFieldsOptions(
    domicileField?.id
  );

  console.log(genderOptions);
  return (
    <Box display="flex" flexDirection="column" gap="12px">
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
      {domicileOptions && (
        <MultipleSelect
          id="domicile"
          label="Domicile"
          options={domicileOptions.data.map((option) => ({
            label: localize(option.attributes.title_multiloc),
            value: option.attributes.key,
          }))}
          onChange={(value) => console.log(value)}
          value={[]}
        />
      )}
    </Box>
  );
};

export default AuthorFilters;
