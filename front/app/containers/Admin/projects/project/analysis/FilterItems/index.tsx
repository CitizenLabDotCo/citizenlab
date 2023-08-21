import {
  Box,
  stylingConsts,
  colors,
  IconButton,
} from '@citizenlab/cl2-component-library';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import useLocalize from 'hooks/useLocalize';
import { isArray, isString } from 'lodash-es';
import React from 'react';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

type FilterItemsProps = {
  filters: IInputsFilterParams;
  isEditable?: boolean;
};

const FilterItems = ({ filters, isEditable }: FilterItemsProps) => {
  const localize = useLocalize();
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

  const translationKeys: Record<string, string> = {
    search: 'Search',
    published_at_from: 'Start',
    published_at_to: 'End',
    reactions_from: 'Reactions >',
    reactions_to: 'Reactions <',
    votes_from: 'Votes >',
    votes_to: 'Votes <',
    comments_from: 'Comments >',
    comments_to: 'Comments <',
    [genderUrlQueryParamKey]: 'Gender',
    [domicileUrlQueryParamKey]: 'Domicile',
    [birthyearUrlQueryParamFromKey]: 'Birthyear >',
    [birthyearUrlQueryParamToKey]: 'Birthyear <',
  };

  const filterEntries = Object.entries(filters).filter(
    ([key]) => key !== 'tag_ids'
  );

  const filterItemDisplayValue = (
    key: string,
    value: string | string[] | undefined | number
  ) => {
    switch (key) {
      case genderUrlQueryParamKey:
        return (
          isArray(value) &&
          value.map((value: string) =>
            localize(
              genderOptions?.data.find((option) => {
                return option.attributes.key === value;
              })?.attributes.title_multiloc
            )
          )
        );
      case domicileUrlQueryParamKey:
        return (
          isArray(value) &&
          value.map((value: string) =>
            localize(
              domicileOptions?.data.find(
                (option) => option.attributes.key === value
              )?.attributes.title_multiloc
            )
          )
        );
      case birthyearUrlQueryParamFromKey:
      case birthyearUrlQueryParamToKey:
        return isString(value) && new Date(value).getFullYear();
      default:
        return value;
    }
  };

  return (
    <Box display="flex" flexWrap="wrap" gap="4px">
      {filterEntries.map(([key, value]) => (
        <Box
          key={key}
          py="4px"
          px="8px"
          borderRadius={stylingConsts.borderRadius}
          borderColor={colors.success}
          borderWidth="1px"
          borderStyle="solid"
          bgColor={colors.white}
          color={colors.success}
          display="flex"
        >
          {translationKeys[key]}
          {': '}
          {filterItemDisplayValue(key, value)}

          {isEditable && (
            <IconButton
              iconName="close"
              iconColor={colors.success}
              iconColorOnHover={colors.success}
              iconWidth="16px"
              iconHeight="16px"
              onClick={() => {
                removeSearchParams([key]);
              }}
              a11y_buttonActionMessage="Remove filter"
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default FilterItems;
