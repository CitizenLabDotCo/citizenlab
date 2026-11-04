import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import LinearScaleField from 'components/CustomFieldsForm/Fields/LinearScale';
import { getLinearScaleLabel } from 'components/CustomFieldsForm/Fields/LinearScale/utils';
import MultiSelectField from 'components/CustomFieldsForm/Fields/MultiSelectField';
import SentimentScaleField from 'components/CustomFieldsForm/Fields/SentimentScaleField';
import { MAXIMUM as SENTIMENT_SCALE_MAXIMUM } from 'components/CustomFieldsForm/Fields/SentimentScaleField/constants';
import { getAriaValueText as getSentimentScaleText } from 'components/CustomFieldsForm/Fields/SentimentScaleField/utils';
import SingleSelectField from 'components/CustomFieldsForm/Fields/SingleSelectField';
import formMessages from 'components/CustomFieldsForm/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

interface Props {
  field: IFlatCustomField;
  answer: unknown;
}

const AnswerValue = ({ field, answer }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  switch (field.input_type) {
    case 'text':
    case 'multiline_text':
      return typeof answer === 'string' ? (
        <Text m="0px" whiteSpace="pre-wrap">
          {answer}
        </Text>
      ) : null;
    case 'number':
      return typeof answer === 'number' ? <Text m="0px">{answer}</Text> : null;
    case 'select':
      return (
        <Box style={{ pointerEvents: 'none' }}>
          <SingleSelectField question={field} disabled />
        </Box>
      );
    case 'multiselect':
      return (
        <Box style={{ pointerEvents: 'none' }}>
          <MultiSelectField question={field} disabled />
        </Box>
      );
    case 'linear_scale': {
      if (typeof answer !== 'number' || field.maximum === undefined) {
        return null;
      }

      const label = getLinearScaleLabel(field, answer);
      const sentence = label
        ? formatMessage(formMessages.valueOutOfTotalWithLabel, {
            value: answer,
            total: field.maximum,
            label: localize(label),
          })
        : formatMessage(formMessages.valueOutOfTotal, {
            value: answer,
            total: field.maximum,
          });

      return (
        <>
          <ScreenReaderOnly>{sentence}</ScreenReaderOnly>
          <Box aria-hidden>
            <LinearScaleField question={field} disabled />
          </Box>
        </>
      );
    }
    case 'sentiment_linear_scale': {
      if (typeof answer !== 'number') return null;

      return (
        <>
          <ScreenReaderOnly>
            {getSentimentScaleText({
              value: answer,
              total: SENTIMENT_SCALE_MAXIMUM,
              question: field,
              formatMessage,
              localize,
            })}
          </ScreenReaderOnly>
          <Box aria-hidden style={{ pointerEvents: 'none' }}>
            <SentimentScaleField
              question={field}
              scrollErrorIntoView={false}
              disabled
            />
          </Box>
        </>
      );
    }
    default:
      return null;
  }
};

export default AnswerValue;
