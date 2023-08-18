import React, { useMemo } from 'react';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import { Box, Label, Select } from '@citizenlab/cl2-component-library';
import useLocalize from 'hooks/useLocalize';
import MultipleSelect from 'components/UI/MultipleSelect';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';
import { useSearchParams } from 'react-router-dom';
import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

const AuthorFilters = () => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
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
  const birthyearUrlQueryParamFromKey = `author_custom_${birthyearField?.id}_from`;
  const birthyearUrlQueryParamToKey = `author_custom_${birthyearField?.id}_to`;

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
          label={formatMessage(messages.gender)}
          options={genderOptions.data.map((option) => ({
            label: localize(option.attributes.title_multiloc),
            value: option.attributes.key,
          }))}
          onChange={(option) =>
            updateSearchParams({ [genderUrlQueryParamKey]: [option.value] })
          }
          value={
            JSON.parse(searchParams.get(genderUrlQueryParamKey) || '[]')[0]
          }
        />
      )}
      {domicileOptions && (
        <MultipleSelect
          inputId="domicile"
          label={formatMessage(messages.domicile)}
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
          <Label>{formatMessage(messages.birthyear)}</Label>
          <Box display="flex" gap="24px" w="100%">
            <Box w="50%">
              <Select
                id="birthyear_from"
                label={formatMessage(messages.from)}
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
                label={formatMessage(messages.to)}
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
