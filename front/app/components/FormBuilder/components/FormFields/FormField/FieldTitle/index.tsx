import React from 'react';

// components
import {
  Box,
  Icon,
  Text,
  IconTooltip,
} from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../../../messages';
import T from 'components/T';

// utils
import { IFlatCustomField } from 'services/formCustomFields';

interface Props {
  hasErrors: boolean;
  field: IFlatCustomField;
  fieldNumber?: number;
}

const FieldTitle = ({ hasErrors, field, fieldNumber }: Props) => {
  const { formatMessage } = useIntl();

  let rowTitle = messages.question;

  if (field.input_type === 'page') {
    rowTitle = messages.page;
  } else if (field.input_type === 'section') {
    rowTitle = messages.section;
  }

  const lockedAttributes = field.constraints?.locks;
  const titleColor = ['page', 'section'].includes(field.input_type)
    ? 'blue500'
    : 'teal400';

  return (
    <Box display="flex">
      {hasErrors && (
        <Icon ml="28px" width="20px" fill={colors.error} name="alert-circle" />
      )}
      <Icon
        ml={hasErrors ? '8px' : '28px'}
        width="12px"
        fill={titleColor}
        name="sort"
        pb="4px"
      />
      <Text
        as="span"
        color={titleColor}
        fontSize="base"
        mt="auto"
        mb="auto"
        fontWeight="bold"
        mx="12px"
      >
        <>
          <FormattedMessage {...rowTitle} />
          {` ${fieldNumber}`}
        </>
      </Text>
      <Text as="span" fontSize="base" mt="auto" mb="auto" color="grey800">
        <Box display="flex">
          <T value={field.title_multiloc} />
          {lockedAttributes?.enabled && (
            <IconTooltip
              placement="top-start"
              iconColor={colors.coolGrey500}
              mb="4px"
              iconSize="16px"
              ml="4px"
              icon="lock"
              content={
                field.input_type === 'section'
                  ? formatMessage(messages.sectionCannotBeDeleted)
                  : formatMessage(messages.questionCannotBeDeleted)
              }
            />
          )}
        </Box>
      </Text>
    </Box>
  );
};

export default FieldTitle;
