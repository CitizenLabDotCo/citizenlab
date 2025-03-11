import React from 'react';

import {
  Box,
  Icon,
  Text,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import T from 'components/T';

import { useIntl, FormattedMessage } from 'utils/cl-intl';

import messages from '../../../messages';

interface Props {
  hasErrors: boolean;
  field: IFlatCustomField;
  fieldNumber?: number;
}

const FieldTitle = ({ hasErrors, field, fieldNumber }: Props) => {
  const { formatMessage } = useIntl();

  let rowTitle = messages.question;

  if (field.input_type === 'page') {
    if (field.key === 'survey_end') {
      rowTitle = messages.lastPage;
    } else {
      rowTitle = messages.page;
    }
  }

  const lockedAttributes = field.constraints?.locks;
  const titleColor = ['page', 'section'].includes(field.input_type)
    ? 'blue500'
    : 'teal400';

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="flex-start"
      w="100%"
    >
      {hasErrors && (
        <Icon ml="12px" width="20px" fill={colors.error} name="alert-circle" />
      )}
      <Box w="12px%" mr="12px">
        <Icon
          ml={hasErrors ? '8px' : '12px'}
          width="12px"
          fill={titleColor}
          name={field.key === 'survey_end' ? 'lock' : 'sort'}
          pb="4px"
        />
      </Box>
      <Box display="flex" flexWrap="wrap">
        <Text
          as="span"
          color={titleColor}
          fontSize="base"
          mt="auto"
          mb="auto"
          fontWeight="bold"
          mr="12px"
        >
          <>
            <FormattedMessage {...rowTitle} />
            {field.key === 'survey_end' ? '' : ` ${fieldNumber}`}
          </>
        </Text>
        <Text
          as="span"
          fontSize="base"
          my="8px"
          color="grey800"
          textOverflow="ellipsis"
          overflow="hidden"
        >
          <Box display="flex" alignItems="center">
            <T value={field.title_multiloc} />
            {lockedAttributes?.enabled && (
              <IconTooltip
                placement="top-start"
                iconColor={colors.coolGrey500}
                iconSize="16px"
                ml="4px"
                icon="lock"
                content={
                  field.input_type === 'page'
                    ? formatMessage(messages.pageCannotBeDeleted)
                    : formatMessage(messages.questionCannotBeDeleted)
                }
              />
            )}
          </Box>
        </Text>
      </Box>
    </Box>
  );
};

export default FieldTitle;
