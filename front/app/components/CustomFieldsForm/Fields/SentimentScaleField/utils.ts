import { FormatMessage } from 'typings';

import { IFlatCustomField } from 'api/custom_fields/types';

import { Localize } from 'hooks/useLocalize';

import messages from 'components/Form/Components/Controls/messages';

import { getLinearScaleLabel } from '../LinearScale/utils';

import Sentiment1Png from './assets/sentiment_1.png';
import Sentiment2Png from './assets/sentiment_2.png';
import Sentiment3Png from './assets/sentiment_3.png';
import Sentiment4Png from './assets/sentiment_4.png';
import Sentiment5Png from './assets/sentiment_5.png';

export const handleKeyboardKeyChange = (event, value) => {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      return Math.max(1, value - 1);
    case 'ArrowRight':
    case 'ArrowUp':
      return Math.min(5, value + 1);
    case 'Home':
      return 1;
    case 'End':
      return 5;
    case 'Enter':
      return value;
    case 'Escape':
      return;
    default:
      return value;
  }
};

const sentimentEmojis: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: Sentiment1Png,
  2: Sentiment2Png,
  3: Sentiment3Png,
  4: Sentiment4Png,
  5: Sentiment5Png,
};

export const getSentimentEmoji = (index: number) =>
  sentimentEmojis[index as keyof typeof sentimentEmojis];

type GetAriaValueTextParams = {
  value: number;
  total: number;
  formatMessage: FormatMessage;
  localize: Localize;
  question: IFlatCustomField;
};

export const getAriaValueText = ({
  value,
  total,
  formatMessage,
  localize,
  question,
}: GetAriaValueTextParams) => {
  // If the value has a label, read it out
  const labelMultiloc = getLinearScaleLabel(question, value);

  if (labelMultiloc) {
    return formatMessage(messages.valueOutOfTotalWithLabel, {
      value,
      total,
      label: localize(labelMultiloc),
    });
  }
  // If we don't have a label but we do have a maximum, read out the current value & maximum label
  const maximumLabelMultiloc = getLinearScaleLabel(question, 5);

  if (maximumLabelMultiloc) {
    return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
      value,
      total,
      maxValue: 5,
      maxLabel: localize(maximumLabelMultiloc),
    });
  }
  // Otherwise, just read out the value and the maximum value
  return formatMessage(messages.valueOutOfTotal, { value, total });
};
