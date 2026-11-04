import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import LinearScaleField from 'components/CustomFieldsForm/Fields/LinearScale';
import { getLinearScaleLabel } from 'components/CustomFieldsForm/Fields/LinearScale/utils';
import MultiSelectField from 'components/CustomFieldsForm/Fields/MultiSelectField';
import SingleSelectField from 'components/CustomFieldsForm/Fields/SingleSelectField';

import { ScreenReaderOnly } from 'utils/a11y';
import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

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
      const sentence = formatMessage(messages.valueOutOfMaximum, {
        value: answer,
        maximum: field.maximum,
      });

      return (
        <>
          <ScreenReaderOnly>
            {label ? `${sentence}, ${localize(label)}` : sentence}
          </ScreenReaderOnly>
          <Box aria-hidden>
            <LinearScaleField question={field} disabled />
          </Box>
        </>
      );
    }
    default:
      return null;
  }
};

export default AnswerValue;
