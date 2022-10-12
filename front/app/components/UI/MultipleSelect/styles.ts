import { colors, fontSizes, defaultStyles } from 'utils/styleUtils';

export function getSelectStyles(borderColor = colors.borderDark) {
  return {
    container: (base) => ({
      ...base,
    }),
    input: (base) => ({
      ...base,
    }),
    control: (base, { isFocused }) => ({
      ...base,
      fontSize: `${fontSizes.base}px`,
      borderWidth: '1px',
      borderColor: isFocused ? colors.black : `${borderColor}`,
      borderRadius: '3px',
      minHeight: '48px',
      backgroundColor: '#fff',
      boxShadow: isFocused ? defaultStyles.boxShadowFocused : 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: colors.black,
      },
    }),
    indicatorSeparator: () => ({
      display: 'none',
    }),
    dropdownIndicator: (base, { isFocused }) => ({
      ...base,
      color: isFocused ? colors.black : `${borderColor}`,
      '&:hover': {
        color: colors.black,
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999',
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
      borderRadius: '3px',
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

export default getSelectStyles();
