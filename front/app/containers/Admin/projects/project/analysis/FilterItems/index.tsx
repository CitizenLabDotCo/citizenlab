import { Box, stylingConsts, colors } from '@citizenlab/cl2-component-library';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import useUserCustomFields from 'api/user_custom_fields/useUserCustomFields';
import useUserCustomFieldsOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';
import useLocalize from 'hooks/useLocalize';
import React from 'react';
import { useIntl } from 'utils/cl-intl';

type FilterItemsProps = {
  filters: IInputsFilterParams;
};
const FilterItems = ({ filters }: FilterItemsProps) => {
  const localize = useLocalize();
  const { formatDate } = useIntl();
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

  //   {k === genderUrlQueryParamKey
  //     ? v.map((value: string) =>
  //         localize(
  //           genderOptions?.data.find((option) => {
  //             return option.attributes.key === value;
  //           })?.attributes.title_multiloc
  //         )
  //       )
  //     : k === domicileUrlQueryParamKey
  //     ? v.map((value: string) =>
  //         localize(
  //           domicileOptions?.data.find(
  //             (option) => option.attributes.key === value
  //           )?.attributes.title_multiloc
  //         )
  //       )
  //     : k === birthyearUrlQueryParamFromKey ||
  //       k === birthyearUrlQueryParamToKey
  //     ? new Date(v).getFullYear()
  //     : v}

  // convert the above to a switch statement

  const filterItems = (k, v) => {
    switch (k) {
      case genderUrlQueryParamKey:
        return v.map((value: string) =>
          localize(
            genderOptions?.data.find((option) => {
              return option.attributes.key === value;
            })?.attributes.title_multiloc
          )
        );
      case domicileUrlQueryParamKey:
        return v.map((value: string) =>
          localize(
            domicileOptions?.data.find(
              (option) => option.attributes.key === value
            )?.attributes.title_multiloc
          )
        );
      case birthyearUrlQueryParamFromKey:
      case birthyearUrlQueryParamToKey:
        return new Date(v).getFullYear();
      default:
        return v;
    }
  };

  console.log(genderOptions);
  return (
    <Box display="flex" flexWrap="wrap" gap="4px">
      {Object.entries(filters)
        .filter(([k]) => k !== 'tag_ids')
        .map(([k, v]) => (
          <Box
            key={k}
            py="4px"
            px="8px"
            borderRadius={stylingConsts.borderRadius}
            bgColor={colors.successLight}
            color={colors.success}
          >
            {translationKeys[k]}
            {': '}
            {filterItems(k, v)}
          </Box>
        ))}
    </Box>
  );
};

export default FilterItems;
