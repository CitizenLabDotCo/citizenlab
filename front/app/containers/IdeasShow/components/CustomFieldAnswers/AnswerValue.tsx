import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import LinearScaleField from 'components/CustomFieldsForm/Fields/LinearScale';
import { getLinearScaleLabel } from 'components/CustomFieldsForm/Fields/LinearScale/utils';
import MultiSelectField from 'components/CustomFieldsForm/Fields/MultiSelectField';
import Rating from 'components/CustomFieldsForm/Fields/RatingField/Rating';
import { MAXIMUM as SENTIMENT_SCALE_MAXIMUM } from 'components/CustomFieldsForm/Fields/SentimentScaleField/constants';
import SentimentScale from 'components/CustomFieldsForm/Fields/SentimentScaleField/SentimentScale';
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
  const { watch } = useFormContext();

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
    case 'rating': {
      if (typeof answer !== 'number' || field.maximum === undefined) {
        return null;
      }

      return (
        <>
          <ScreenReaderOnly>
            {formatMessage(formMessages.valueOutOfTotal, {
              value: answer,
              total: field.maximum,
            })}
          </ScreenReaderOnly>
          <Box aria-hidden style={{ pointerEvents: 'none' }}>
            <Rating
              question={field}
              value={answer}
              onChange={() => {}}
              disabled
            />
          </Box>
        </>
      );
    }
    case 'sentiment_linear_scale': {
      if (typeof answer !== 'number') return null;

      const followUp = watch(`${field.key}_follow_up`);

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
            <SentimentScale
              question={field}
              value={answer}
              onChange={() => {}}
              disabled
            />
          </Box>
          {typeof followUp === 'string' && (
            <Text mt="12px" mb="0px">
              {followUp}
            </Text>
          )}
        </>
      );
    }
    default:
      return null;
  }
};

export default AnswerValue;
