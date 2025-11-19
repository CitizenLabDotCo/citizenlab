import { useChartAccessibility } from './ChartAccessibilityContext';

/**
 * Hook to get accessibility props(role, aria-label and aria-describedby) for Recharts components
 */
export const useRechartsAccessibility = () => {
  const { ariaLabel, ariaDescribedBy } = useChartAccessibility();

  return {
    accessibilityLayer: true,
    role: 'img',
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    tabIndex: 0,
  };
};
