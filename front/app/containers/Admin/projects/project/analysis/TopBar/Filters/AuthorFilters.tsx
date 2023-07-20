import React, { useMemo } from 'react';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { Box, Label, Select } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import MultipleSelect from 'components/UI/MultipleSelect';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearchParams } from 'react-router-dom';

const AuthorFilters = () => {
  const localize = useLocalize();
  const [searchParams] = useSearchParams();
  const { data: customFields } = useUserCustomFields();

  const genderField = customFields?.data.find(
    (field) => field.attributes.code === 'gender'
  );

  const domicileField = customFields?.data.find(
    (field) => field.attributes.code === 'domicile'
  );

  const birthyearField = customFields?.data.find(
    (field) => field.attributes.code === 'birthyear'
  );

  const { data: genderOptions } = useUserCustomFieldsOptions(genderField?.id);
  const { data: domicileOptions } = useUserCustomFieldsOptions(
    domicileField?.id
  );

  const genderUrlQueryParamKey = `author_custom_${genderField?.id}`;
  const domicileUrlQueryParamKey = `author_custom_${domicileField?.id}`;
  const birthyearUrlQueryParamFromKey = `author_custom_from_${birthyearField?.id}`;
  const birthyearUrlQueryParamToKey = `author_custom_to_${birthyearField?.id}`;

  const yearOptions = useMemo(
    () =>
      Array.from(
        { length: new Date().getFullYear() - 1900 },
        (_, i) => new Date().getFullYear() - i
      ).map((option) => ({
        label: option.toString(),
        value: new Date(option, 0, 1).toISOString(),
      })),
    []
  );

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
          onChange={(option) =>
            updateSearchParams({ [genderUrlQueryParamKey]: option.value })
          }
          value={searchParams.get(genderUrlQueryParamKey)}
        />
      )}
      {domicileOptions && (
        <MultipleSelect
          inputId="domicile"
          label="Domicile"
          options={domicileOptions.data.map((option) => ({
            label: localize(option.attributes.title_multiloc),
            value: option.attributes.key,
          }))}
          onChange={(selectedOptions) => {
            updateSearchParams({
              [domicileUrlQueryParamKey]: selectedOptions.map(
                (option) => option.value
              ),
            });
          }}
          value={JSON.parse(searchParams.get(domicileUrlQueryParamKey) || '[]')}
        />
      )}
      {birthyearField && (
        <Box>
          <Label>Birthyear</Label>
          <Box display="flex" gap="24px" w="100%">
            <Box w="50%">
              <Select
                id="birthyear_from"
                label="From"
                options={yearOptions}
                onChange={(option) =>
                  updateSearchParams({
                    [birthyearUrlQueryParamFromKey]: option.value,
                  })
                }
                value={searchParams.get(birthyearUrlQueryParamFromKey)}
              />
            </Box>
            <Box w="50%">
              <Select
                id="birthyear_to"
                label="To"
                options={yearOptions}
                onChange={(option) =>
                  updateSearchParams({
                    [birthyearUrlQueryParamToKey]: option.value,
                  })
                }
                value={searchParams.get(birthyearUrlQueryParamToKey)}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default AuthorFilters;
