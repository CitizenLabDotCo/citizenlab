import { colors, fontSizes } from 'utils/styleUtils';

export function getSelectStyles(borderColor = '#ccc') {
  return {
    container: (base) => ({
      ...base,
    }),
    control: (base, { isFocused }) => ({
      ...base,
      fontSize: `${fontSizes.base}px`,
      borderWidth: '1px',
      borderColor: isFocused ? '#000' : `${borderColor}`,
      borderRadius: '5px',
      minHeight: '48px',
      backgroundColor: '#FFF',
      boxShadow: 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: isFocused ? '#000' : '#aaa'
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: colors.placeholder
    }),
    option: (base, { isFocused }) => ({
      ...base,
      ':active': null,
      fontSize: `${fontSizes.base}px`,
      color: isFocused ? colors.text : colors.label,
      backgroundColor: isFocused ? colors.clDropdownHoverBackground : '#fff',
    }),
    multiValueLabel: () => ({
      fontSize: `${fontSizes.base}px`,
      padding: '6px',
    }),
  };
}

export default getSelectStyles();
