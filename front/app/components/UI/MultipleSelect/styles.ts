import {
  bo,
  colors,
  stylingConsts,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { DefaultTheme } from 'styled-components';

interface Settings {
  fontSize?: number;
  minHeight?: number;
  borderRadius?: string;
}

export const boSelectSettings: Settings = {
  fontSize: fontSizes.xs,
  minHeight: 36,
  borderRadius: bo.borderRadius,
};

function getSelectStyles(theme: DefaultTheme, settings?: Settings) {
  const fontSize = settings?.fontSize || fontSizes.base;
  const minHeight = settings?.minHeight || stylingConsts.inputHeight;
  const borderRadius = settings?.borderRadius || stylingConsts.borderRadius;

  return {
    valueContainer: (base) => ({
      ...base,
      /* This will ensure that the selected values do not overflow the container when the value is a very long word,
        The overflowing makes it impossible to delete the selected value on a phone.
        Assuming here that the selected value of a multiselect will never need to be wider than 80vw,
        which seems safe.
        An ellipsis will be used in that case to indicate that the value is too long.
      */
      maxWidth: '80vw',
    }),
    input: (base) => ({
      ...base,
    }),
    control: (base, { isFocused, isDisabled }) => ({
      ...base,
      fontSize: `${fontSize}px`,
      borderWidth: isFocused ? '2px' : '1px',
      borderColor: isDisabled
        ? colors.grey400
        : isFocused
        ? theme.colors.tenantPrimary
        : `${colors.borderDark}`,
      borderRadius,
      minHeight,
      // Matches the disabled style of defaultInputStyle (e.g. Input)
      backgroundColor: isDisabled ? `${colors.grey100}` : '#fff',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: isDisabled
          ? colors.grey400
          : `${theme.colors.tenantPrimary}`,
      },
    }),
    singleValue: (base, { isDisabled }) => ({
      ...base,
      color: isDisabled ? colors.grey700 : base.color,
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, { isFocused, isDisabled }) => ({
      ...base,
      color: isDisabled
        ? colors.grey400
        : isFocused
        ? `${theme.colors.tenantPrimary}`
        : `${colors.borderDark}`,
      '&:hover': {
        color: `${theme.colors.tenantPrimary}`,
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999',
    }),
    menuPortal: (base) => ({
      ...base,
      // Without this an open menu is painted under the control of the next
      // question on the form (see TAN-4671).
      zIndex: 1001,
    }),
    // Only a custom radius changes the menu, so other selects keep theirs.
    menu: (base) =>
      settings?.borderRadius
        ? { ...base, borderRadius, overflow: 'hidden' }
        : base,
    menuList: (base) => ({
      ...base,
      borderRadius,
    }),
    option: (base, { isFocused }) => ({
      ...base,
      ':active': null,
      fontSize: `${fontSize}px`,
      color: isFocused ? colors.textPrimary : colors.textSecondary,
      backgroundColor: isFocused ? colors.grey300 : '#fff',
      cursor: 'pointer',
    }),
    multiValue: (base) => ({
      ...base,
      borderRadius: stylingConsts.borderRadius,
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: `${fontSize}px`,
      padding: '6px',
      paddingLeft: '10px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      fontSize: `${fontSize}px`,
      ':hover': {
        background: colors.grey400,
      },
    }),
  };
}

export default getSelectStyles;
