import { rgba } from 'polished';

export default function customSelectStyles(tenantColor: string) {
  return ({
    control: (base, state) => ({
      ...base,
      borderWidth: '1px',
      borderColor: state.isFocused ? tenantColor : '#ccc',
      boxShadow: state.isFocused ? `0 0 0 1px ${tenantColor}` : 'none',
      ':hover': {
        borderColor: tenantColor,
      },
    }),

    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? rgba(tenantColor as string, .2) : state.isSelected ? rgba(tenantColor as string, .6) : 'transparent',
      ':active': {
        backgroundColor: rgba(tenantColor as string, .4),
      },
    }),
  });
}
