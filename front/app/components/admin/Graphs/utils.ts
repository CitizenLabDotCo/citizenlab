// styling
import { legacyColors } from './styling';

// utils
import { isEmpty } from 'lodash-es';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { Tooltip, TooltipConfig } from './typings';

export const hasNoData = (
  data: Record<string, any>[] | NilOrError
): data is NilOrError =>
  isNilOrError(data) || data.every(isEmpty) || data.length <= 0;

export const getTooltipConfig = (
  tooltip?: boolean | Tooltip | ((props: TooltipConfig) => React.ReactNode)
): TooltipConfig => {
  const defaultTooltipConfig = {
    isAnimationActive: false,
    cursor: { fill: legacyColors.barHover },
  };

  return typeof tooltip === 'object'
    ? { ...defaultTooltipConfig, ...tooltip }
    : defaultTooltipConfig;
};
