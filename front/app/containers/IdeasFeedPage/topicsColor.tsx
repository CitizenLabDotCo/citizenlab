import { colors } from '@citizenlab/cl2-component-library';
export interface TopicColorPair {
  background: string;
  progressBar: string;
}

const TOPIC_COLOR_PALETTE: TopicColorPair[] = [
  { background: '#FFD4D8', progressBar: '#E5939C' }, // Pastel red/pink
  { background: '#D6FFE0', progressBar: '#8FE5A3' }, // Pastel green
  { background: '#D6EDFF', progressBar: '#8CC8E5' }, // Pastel blue
  { background: '#FFFFD6', progressBar: '#E5E58C' }, // Pastel yellow
  { background: '#FFEBD6', progressBar: '#E5B88C' }, // Pastel orange
  { background: '#EDD6F0', progressBar: '#C494C9' }, // Pastel purple
  { background: '#FFECE6', progressBar: '#E5BAA8' }, // Pastel peach
  { background: '#DDE2F3', progressBar: '#A3ACCF' }, // Pastel lavender
  { background: '#D0F3E7', progressBar: '#8BCFB5' }, // Pastel mint
  { background: '#FFF0D1', progressBar: '#E5C78C' }, // Pastel gold
  { background: '#E6F9EB', progressBar: '#A8D9B5' }, // Pastel lime
  { background: '#FFD6F2', progressBar: '#E58CC9' }, // Pastel magenta
  { background: '#C5E8ED', progressBar: '#5CB8C2' }, // Teal
  { background: '#FFF0EE', progressBar: '#E5BAB5' }, // Misty rose
  { background: '#F0F0FC', progressBar: '#C4C4E0' }, // Lavender mist
  { background: '#F7F2B8', progressBar: '#D4C96E' }, // Khaki
];

const getTopicColorIndex = (topicId?: string): number => {
  const hash = [...(topicId || '')].reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
    0
  );
  return Math.abs(hash) % TOPIC_COLOR_PALETTE.length;
};

export const getTopicColor = (topicId?: string): string => {
  const index = getTopicColorIndex(topicId);
  return topicId ? TOPIC_COLOR_PALETTE[index].background : colors.white;
};

export const getTopicProgressBarColor = (topicId: string): string => {
  const index = getTopicColorIndex(topicId);
  return TOPIC_COLOR_PALETTE[index].progressBar;
};
