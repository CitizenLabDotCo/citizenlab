import styled from 'styled-components';

import messages from '../messages';

import Sentiment1Svg from './assets/sentiment_1.svg';
import Sentiment2Svg from './assets/sentiment_2.svg';
import Sentiment3Svg from './assets/sentiment_3.svg';
import Sentiment4Svg from './assets/sentiment_4.svg';
import Sentiment5Svg from './assets/sentiment_5.svg';

export const StyledImg = styled.img`
  padding: 4px;
  border: 3px solid white;
  border-radius: 4px;
  height: 50px;

  &.anotherValueSelected {
    filter: grayscale(1);
    opacity: 0.8;
  }

  &.isSelected {
    border: 3px solid ${({ theme }) => theme.colors.coolGrey600};
  }

  &:hover {
    border: 3px solid ${({ theme }) => theme.colors.coolGrey600};
  }
`;

export const getClassNameSentimentImage = (data, visualIndex) => {
  if (data === visualIndex) {
    return 'isSelected';
  } else if (data) {
    return 'anotherValueSelected';
  }
  return '';
};

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
    default:
      return;
  }
};

export const getSentimentEmoji = (index: number) => {
  switch (index) {
    case 1:
      return Sentiment1Svg;
    case 2:
      return Sentiment2Svg;
    case 3:
      return Sentiment3Svg;
    case 4:
      return Sentiment4Svg;
    case 5:
      return Sentiment5Svg;
  }
  return Sentiment1Svg;
};

type GetAriaValueTextProps = {
  uischema: any;
  formatMessage: any;
  value: number;
  total: number;
};

export const getAriaValueText = ({
  uischema,
  formatMessage,
  value,
  total,
}: GetAriaValueTextProps) => {
  // If the value has a label, read it out
  if (uischema.options?.[`linear_scale_label${value}`]) {
    return formatMessage(messages.valueOutOfTotalWithLabel, {
      value,
      total,
      label: uischema.options[`linear_scale_label${value}`],
    });
  }
  // If we don't have a label but we do have a maximum, read out the current value & maximum label
  else if (uischema.options?.[`linear_scale_label${5}`]) {
    return formatMessage(messages.valueOutOfTotalWithMaxExplanation, {
      value,
      total,
      maxValue: 5,
      maxLabel: uischema.options[`linear_scale_label${5}`],
    });
  }
  // Otherwise, just read out the value and the maximum value
  return formatMessage(messages.valueOutOfTotal, { value, total });
};
