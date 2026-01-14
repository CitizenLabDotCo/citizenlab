import { colors } from '@citizenlab/cl2-component-library';
export interface TopicColorPair {
  background: string;
  progressBar: string;
}

const TOPIC_COLOR_PALETTE: TopicColorPair[] = [
  { background: '#FFB3BA', progressBar: '#E5939C' }, // Pastel red/pink
  { background: '#BAFFC9', progressBar: '#8FE5A3' }, // Pastel green
  { background: '#BAE1FF', progressBar: '#8CC8E5' }, // Pastel blue
  { background: '#FFFFBA', progressBar: '#E5E58C' }, // Pastel yellow
  { background: '#FFD9BA', progressBar: '#E5B88C' }, // Pastel orange
  { background: '#E0BBE4', progressBar: '#C494C9' }, // Pastel purple
  { background: '#FFDFD3', progressBar: '#E5BAA8' }, // Pastel peach
  { background: '#C7CEEA', progressBar: '#A3ACCF' }, // Pastel lavender
  { background: '#B5EAD7', progressBar: '#8BCFB5' }, // Pastel mint
  { background: '#FFE5B4', progressBar: '#E5C78C' }, // Pastel gold
  { background: '#D4F4DD', progressBar: '#A8D9B5' }, // Pastel lime
  { background: '#FFB5E8', progressBar: '#E58CC9' }, // Pastel magenta
  { background: colors.teal200, progressBar: '#5CB8C2' }, // Teal
  { background: '#FFE4E1', progressBar: '#E5BAB5' }, // Misty rose
  { background: '#E6E6FA', progressBar: '#C4C4E0' }, // Lavender mist
  { background: '#F0E68C', progressBar: '#D4C96E' }, // Khaki
];

const getTopicColorIndex = (topicId?: string): number => {
  const hash = [...(topicId || '')].reduce(
    (acc, char) => char.charCodeAt(0) + ((acc << 5) - acc),
    0
  );
  return Math.abs(hash) % TOPIC_COLOR_PALETTE.length;
};

export const getTopicColor = (topicId: string): string => {
  const index = getTopicColorIndex(topicId);
  return TOPIC_COLOR_PALETTE[index].background;
};

export const getTopicProgressBarColor = (topicId: string): string => {
  const index = getTopicColorIndex(topicId);
  return TOPIC_COLOR_PALETTE[index].progressBar;
};
