import { INSIGHTS_CHART_COLORS } from '../../constants';

export const getStripedPattern = () => `repeating-linear-gradient(
  135deg,
  ${INSIGHTS_CHART_COLORS.darkBlue},
  ${INSIGHTS_CHART_COLORS.darkBlue} 3px,
  ${INSIGHTS_CHART_COLORS.lightBlue} 3px,
  ${INSIGHTS_CHART_COLORS.lightBlue} 6px
)`;
