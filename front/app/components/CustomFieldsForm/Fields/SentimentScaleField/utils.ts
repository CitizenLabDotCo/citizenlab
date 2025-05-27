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

export const getAriaValueText = (obj: any) => {
  return '';
};
