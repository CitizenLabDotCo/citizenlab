import { colors } from '@citizenlab/cl2-component-library';
import { readableColor } from 'polished';

/**
 * Generate a consistent color for each topic
 * Uses a predefined palette of accessible colors that ensure
 * good contrast with both dark and light text (WCAG AA compliant)
 */
const TOPIC_COLOR_PALETTE = [
  colors.teal200, // Light teal - #80CFD8
  colors.orange100, // Light orange - #FFECE6
  colors.green100, // Light green - #e4f7ef
  '#FFE6F0', // Light pink
  '#E6E6FF', // Light lavender
  '#FFF4E6', // Light peach
  '#E6F9FF', // Light sky blue
  '#F0E6FF', // Light purple
  '#FFFFE6', // Light yellow
  '#E6FFF0', // Light mint
  '#FFE6E6', // Light coral
  '#F5E6FF', // Light lilac
  colors.teal100, // Lighter teal - #BEE7EB
  colors.grey100, // Light grey - #F4F6F8
  '#D4F1F4', // Pale cyan
  '#FFE4D6', // Pale orange
];

// Function to get a consistent color for a topic ID
export const getTopicColor = (topicId: string): string => {
  // Use a simple hash of the topic ID to get a consistent color index
  let hash = 0;
  for (let i = 0; i < topicId.length; i++) {
    hash = topicId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % TOPIC_COLOR_PALETTE.length;
  return TOPIC_COLOR_PALETTE[index];
};

// Get text color that contrasts well with the background
export const getContrastingTextColor = (backgroundColor: string): string => {
  return readableColor(backgroundColor, colors.grey800, colors.white);
};

// Create a map of topic IDs to colors for multiple topics
export const createTopicColorMap = (
  topicIds: string[]
): Map<string, { background: string; text: string }> => {
  const colorMap = new Map<string, { background: string; text: string }>();

  topicIds.forEach((topicId) => {
    const backgroundColor = getTopicColor(topicId);
    const textColor = getContrastingTextColor(backgroundColor);
    colorMap.set(topicId, {
      background: backgroundColor,
      text: textColor,
    });
  });

  return colorMap;
};

// Get the primary topic color for an idea (uses first topic if multiple)
export const getPrimaryTopicColor = (
  topicIds: string[]
): { background: string; text: string } | null => {
  if (!topicIds || topicIds.length === 0) {
    // Default to teal if no topics
    return {
      background: colors.teal200,
      text: getContrastingTextColor(colors.teal200),
    };
  }

  const primaryTopicId = topicIds[0];
  const backgroundColor = getTopicColor(primaryTopicId);
  const textColor = getContrastingTextColor(backgroundColor);

  return {
    background: backgroundColor,
    text: textColor,
  };
};
