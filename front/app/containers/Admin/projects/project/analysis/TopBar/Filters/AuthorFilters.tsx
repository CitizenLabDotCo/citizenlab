import React, { useMemo } from 'react';

import {
  Box,
  Label,
  Select,
  Button,
  Text,
} from '@citizenlab/cl2-component-library';
import { useSearchParams } from 'react-router-dom';

import useUserCustomFieldsOptions from 'api/custom_field_options/useCustomFieldOptions';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';

import useLocalize from 'hooks/useLocalize';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import tracks from '../../tracks';
import { handleArraySearchParam } from '../../util';
import messages from '../messages';

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
        value: option.toString(),
      })),
    []
  );

  const selectedGenderOptions = handleArraySearchParam(
    searchParams,
    genderUrlQueryParamKey
  );

  const selectedDomicileOptions = handleArraySearchParam(
    searchParams,
    domicileUrlQueryParamKey
  );

  const toggleOptionInArray = (array: string[] | undefined, option: string) => {
    if (array?.includes(option)) {
      const arrayWithoutOption = array.filter((el: string) => el !== option);
      return arrayWithoutOption.length > 0 ? arrayWithoutOption : undefined;
    }
    return array ? [...array, option] : [option];
  };

  return (
    <Box display="flex" flexDirection="column" gap="12px">
      <Text color="textSecondary" m="0px">
        {formatMessage(messages.gender)}
      </Text>
      <Box display="flex" gap="12px" flexWrap="wrap">
        <Button
          buttonStyle={
            !selectedGenderOptions ? 'admin-dark' : 'secondary-outlined'
          }
          onClick={() =>
            updateSearchParams({
              [genderUrlQueryParamKey]: undefined,
            })
          }
          p="4px 12px"
        >
          {formatMessage(messages.all)}
        </Button>

        {genderOptions?.data.map((option) => (
          <Button
            key={option.id}
            buttonStyle={
              selectedGenderOptions?.includes(option.attributes.key)
                ? 'admin-dark'
                : 'secondary-outlined'
            }
            onClick={() => {
              updateSearchParams({
                [genderUrlQueryParamKey]: toggleOptionInArray(
                  selectedGenderOptions,
                  option.attributes.key
                ),
              });
              trackEventByName(tracks.authorFilterUsed, {
                type: 'gender',
              });
            }}
            p="4px 8px"
          >
            {localize(option.attributes.title_multiloc)}
          </Button>
        ))}
      </Box>
      <Text color="textSecondary" m="0px">
        {formatMessage(messages.domicile)}
      </Text>
      <Box display="flex" gap="12px" flexWrap="wrap">
        <Button
          buttonStyle={
            !selectedDomicileOptions ? 'admin-dark' : 'secondary-outlined'
          }
          onClick={() =>
            updateSearchParams({
              [domicileUrlQueryParamKey]: undefined,
            })
          }
          p="4px 12px"
        >
          {formatMessage(messages.all)}
        </Button>

        {domicileOptions?.data.map((option) => (
          <Button
            key={option.id}
            buttonStyle={
              selectedDomicileOptions?.includes(option.attributes.key)
                ? 'admin-dark'
                : 'secondary-outlined'
            }
            onClick={() => {
              updateSearchParams({
                [domicileUrlQueryParamKey]: toggleOptionInArray(
                  selectedDomicileOptions,
                  option.attributes.key
                ),
              });
              trackEventByName(tracks.authorFilterUsed, {
                type: 'domicile',
              });
            }}
            p="4px 8px"
          >
            {localize(option.attributes.title_multiloc)}
          </Button>
        ))}
      </Box>
      {birthyearField && (
        <Box>
          <Label>{formatMessage(messages.birthyear)}</Label>
          <Box display="flex" gap="24px" w="100%">
            <Box w="50%">
              <Select
                id="birthyear_from"
                label={formatMessage(messages.from)}
                options={yearOptions}
                onChange={(option) => {
                  updateSearchParams({
                    [birthyearUrlQueryParamFromKey]: option.value,
                  });
                  trackEventByName(tracks.authorFilterUsed, {
                    type: 'birthyear',
                  });
                }}
                value={searchParams.get(birthyearUrlQueryParamFromKey)}
              />
            </Box>
            <Box w="50%">
              <Select
                id="birthyear_to"
                label={formatMessage(messages.to)}
                options={yearOptions}
                onChange={(option) => {
                  updateSearchParams({
                    [birthyearUrlQueryParamToKey]: option.value,
                  });
                  trackEventByName(tracks.authorFilterUsed, {
                    type: 'birthyear',
                  });
                }}
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
