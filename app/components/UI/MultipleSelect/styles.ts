import { colors, fontSizes } from 'utils/styleUtils';
import { transparentize } from 'polished';

export function getSelectStyles(borderColor = colors.border) {
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
      borderColor: isFocused ? colors.focussedBorder : `${borderColor}`,
      borderRadius: '3px',
      minHeight: '48px',
      backgroundColor: '#fff',
      boxShadow: isFocused ? `0px 0px 0px 1px ${transparentize(0.4, colors.focussedBorder)}` : 'none',
      cursor: 'pointer',
      '&:hover': {
        borderColor: isFocused ? colors.focussedBorder : colors.hoveredBorder
      }
    }),
    indicatorSeparator: () => ({
      display: 'none'
    }),
    dropdownIndicator: (base, { isFocused }) => ({
      ...base,
      color: isFocused ? colors.focussedBorder : `${borderColor}`,
      '&:hover': {
        color: isFocused ? colors.focussedBorder : colors.hoveredBorder
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999'
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
