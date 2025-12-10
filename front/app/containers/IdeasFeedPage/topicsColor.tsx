import { colors } from '@citizenlab/cl2-component-library';

/**
 * Generate a consistent color for each topic
 * Uses a predefined palette of light pastel colors that work well with dark grey text
 * Colors are chosen to be visually distinct from each other
 */
const TOPIC_COLOR_PALETTE = [
  '#FFB3BA', // Pastel red/pink
  '#BAFFC9', // Pastel green
  '#BAE1FF', // Pastel blue
  '#FFFFBA', // Pastel yellow
  '#FFD9BA', // Pastel orange
  '#E0BBE4', // Pastel purple
  '#FFDFD3', // Pastel peach
  '#C7CEEA', // Pastel lavender
  '#B5EAD7', // Pastel mint
  '#FFE5B4', // Pastel gold
  '#D4F4DD', // Pastel lime
  '#FFB5E8', // Pastel magenta
  colors.teal200, // Teal - #80CFD8
  '#FFE4E1', // Misty rose
  '#E6E6FA', // Lavender mist
  '#F0E68C', // Khaki
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

// Create a map of topic IDs to colors for multiple topics
// All colors use grey800 for text
export const createTopicColorMap = (
  topicIds: string[]
): Map<string, string> => {
  const colorMap = new Map<string, string>();

  topicIds.forEach((topicId) => {
    const backgroundColor = getTopicColor(topicId);
    colorMap.set(topicId, backgroundColor);
  });

  return colorMap;
};

// Get the primary topic color for an idea (uses first topic if multiple)
export const getPrimaryTopicColor = (
  topicIds: string[]
): { background: string; text: string } | null => {
  if (topicIds.length === 0) {
    // Default to teal if no topics
    return {
      background: colors.teal200,
      text: colors.grey800,
    };
  }

  const primaryTopicId = topicIds[0];
  const backgroundColor = getTopicColor(primaryTopicId);

  return {
    background: backgroundColor,
    text: colors.grey800,
  };
};
