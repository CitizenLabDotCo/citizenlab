import { darken } from 'polished';

import { colors } from '../../utils/styleUtils';

type CheckboxElement =
  | 'border'
  | 'hoverBorder'
  | 'background'
  | 'hoverBackground';

type Props = {
  checkedColor?: string;
  checkedOrIndeterminate: boolean;
  element: CheckboxElement;
  usePrimaryBorder?: boolean;
};

export const getColor = ({
  checkedColor,
  checkedOrIndeterminate,
  element,
  usePrimaryBorder = false,
}: Props) => {
  if (!checkedOrIndeterminate && !usePrimaryBorder) {
    switch (element) {
      case 'border':
        return colors.borderDark;
      case 'background':
        return colors.white;
      case 'hoverBorder':
        return colors.black;
      case 'hoverBackground':
        return colors.white;
    }
  }
  switch (element) {
    case 'border':
      return checkedColor ? checkedColor : colors.success;
    case 'background':
      return checkedColor ? checkedColor : colors.success;
    case 'hoverBorder':
      return checkedColor
        ? darken(0.05, checkedColor)
        : darken(0.05, colors.success);
    case 'hoverBackground':
      return checkedColor
        ? darken(0.05, checkedColor)
        : darken(0.05, colors.success);
  }
};
