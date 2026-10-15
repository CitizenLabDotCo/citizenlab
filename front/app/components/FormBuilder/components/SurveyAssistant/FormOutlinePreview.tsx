import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import { getCustomFieldBadgeLabel } from '../FormFields/utils';

import messages from './messages';
import { toOutline } from './utils';

type Props = {
  args: Record<string, unknown>;
};

// Outline of the survey proposed by the replace_form_fields tool.
const FormOutlinePreview = ({ args }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const outline = toOutline(args.fields);
  const pageCount = outline.filter((item) => item.kind === 'page').length;
  const questionCount = outline.filter(
    (item) => item.kind === 'question'
  ).length;

  return (
    <Box display="flex" flexDirection="column" gap="4px">
      <Text m="0px" fontSize="s" color="textSecondary">
        <FormattedMessage
          {...messages.outlineSummary}
          values={{ pages: pageCount, questions: questionCount }}
        />
      </Text>
      {outline.map((item) => {
        if (item.kind === 'endPage') {
          return (
            <Text key={item.key} m="0px" mt="8px" fontWeight="bold">
              {formatMessage(messages.endPage)}
            </Text>
          );
        }

        if (item.kind === 'page') {
          return (
            <Text key={item.key} m="0px" mt="8px" fontWeight="bold">
              {localize(item.title) ||
                formatMessage(messages.pageNumber, { number: item.number })}
            </Text>
          );
        }

        return (
          <Box
            key={item.key}
            pl="12px"
            borderLeft={`2px solid ${colors.borderLight}`}
          >
            <Text m="0px">
              {localize(item.title) || formatMessage(messages.untitled)}
            </Text>
            <Text m="0px" fontSize="xs" color="textSecondary">
              {formatMessage(getCustomFieldBadgeLabel(item.inputType))}
              {item.required && ` · ${formatMessage(messages.required)}`}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};

export default FormOutlinePreview;
