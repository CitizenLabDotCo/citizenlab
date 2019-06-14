import { colors, fontSizes } from 'utils/styleUtils';

export function getSelectStyles(borderColor = '#ccc') {
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
      borderColor: isFocused ? '#000' : `${borderColor}`,
      borderRadius: '5px',
      minHeight: '48px',
      backgroundColor: '#fff',
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
      cursor: 'pointer'
    }),
    multiValue: (base) => ({
      ...base,
      borderRadius: '3px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      fontSize: `${fontSizes.base}px`,
      padding: '6px',
      paddingLeft: '10px'
    }),
    multiValueRemove: (base) => ({
      ...base,
      fontSize: `${fontSizes.large}px`,
      ':hover': {
        background: '#ccc'
      }
    })
  };
}

export default getSelectStyles();
