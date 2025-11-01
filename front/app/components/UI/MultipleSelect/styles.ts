import {
  colors,
  fontSizes,
  stylingConsts,
} from '@citizenlab/cl2-component-library';
import { DefaultTheme } from 'styled-components';

function getSelectStyles(theme: DefaultTheme) {
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
    control: (base, { isFocused }) => ({
      ...base,
      fontSize: `${fontSizes.base}px`,
      borderWidth: isFocused ? '2px' : '1px',
      borderColor: isFocused
        ? theme.colors.tenantPrimary
        : `${colors.borderDark}`,
      borderRadius: stylingConsts.borderRadius,
      minHeight: `${stylingConsts.inputHeight}px`,
      backgroundColor: '#fff',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: `${theme.colors.tenantPrimary}`,
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, { isFocused }) => ({
      ...base,
      color: isFocused
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
    menuList: (base) => ({
      ...base,
      borderRadius: stylingConsts.borderRadius,
    }),
    option: (base, { isFocused }) => ({
      ...base,
      ':active': null,
      fontSize: `${fontSizes.base}px`,
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
      fontSize: `${fontSizes.base}px`,
      padding: '6px',
      paddingLeft: '10px',
    }),
    multiValueRemove: (base) => ({
      ...base,
      fontSize: `${fontSizes.l}px`,
      ':hover': {
        background: '#ccc',
      },
    }),
  };
}

export default getSelectStyles;
