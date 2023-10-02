import {
  Box,
  IconButton,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import React from 'react';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import T from 'components/T';
import ShortUserFieldValue from '../components/ShortUserFieldValue';
import ElipsisFilterValue from './EllipsisFilterValue';
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  customFieldId: string;
  filterKey: string;
  filterValue: string | string[] | null[] | undefined | number;
  isEditable: boolean;
  predicate: '<' | '>' | '=';
};

const AuthorFieldFilterItem = ({
  customFieldId,
  filterKey,
  filterValue,
  isEditable = true,
  predicate,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: customField } = useUserCustomField(customFieldId);

  if (!customField) return null;

  return (
    <Box
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
      <Box>
        <T value={customField?.data.attributes.title_multiloc} />
      </Box>
      <Box mx="3px">{predicate}</Box>
      <ElipsisFilterValue>
        {Array.isArray(filterValue) &&
          customField.data.attributes.input_type !== 'multiselect' &&
          filterValue.map((filterItem, index) => (
            <>
              {index !== 0 && ', '}
              <ShortUserFieldValue
                key={filterItem}
                customField={customField}
                rawValue={filterItem}
              />
            </>
          ))}
        {(!Array.isArray(filterValue) ||
          customField.data.attributes.input_type === 'multiselect') && (
          <ShortUserFieldValue
            customField={customField}
            rawValue={filterValue}
          />
        )}
      </ElipsisFilterValue>

      {isEditable && (
        <IconButton
          iconName="close"
          iconColor={colors.success}
          iconColorOnHover={colors.success}
          iconWidth="16px"
          iconHeight="16px"
          onClick={() => {
            removeSearchParams([filterKey]);
          }}
          a11y_buttonActionMessage={formatMessage(messages.removeFilter)}
        />
      )}
    </Box>
  );
};

export default AuthorFieldFilterItem;
