import { colors } from 'utils/styleUtils';

const SelectStyles = {
    container: (base) => ({
      ...base,
    }),
    control: (base, { isFocused }) => ({
      ...base,
      fontSize: '16px',
      borderWidth: '1px',
      borderColor: isFocused ? '#000' : '#ccc',
      borderRadius: '5px',
      minHeight: '48px',
      backgroundColor: '#FFF',
      boxShadow: 'none',
      '&:hover': {
        borderColor: isFocused ? '#000' : '#aaa'
      },
    }),
    option: (base, { isFocused }) => ({
      ...base,
      ':active': null,
      fontSize: '16px',
      color: isFocused ? colors.clGreyHover : colors.clGrey,
      backgroundColor: isFocused ? colors.clDropdownHoverBackground : '#fff',
    }),
    multiValueLabel: () => ({
      fontSize: '16px',
      padding: '6px',
    }),
  };

export default SelectStyles;
