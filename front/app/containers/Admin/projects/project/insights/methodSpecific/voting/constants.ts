export const CHART_COLORS = {
  darkBlue: '#2F478A',
  lightBlue: '#B8C4E0',
} as const;

// Striped pattern for in-person votes
export const getStripedPattern = () => `repeating-linear-gradient(
  135deg,
  ${CHART_COLORS.darkBlue},
  ${CHART_COLORS.darkBlue} 3px,
  ${CHART_COLORS.lightBlue} 3px,
  ${CHART_COLORS.lightBlue} 6px
)`;
