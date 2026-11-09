import { ButtonProps, colors } from '@citizenlab/cl2-component-library';

// The look of the action rows in the Manage side column: a label with its icon
// at the far end.
export const actionRowProps = {
  buttonStyle: 'bo-secondary',
  width: '100%',
  height: '44px',
  justify: 'space-between',
  iconPos: 'right',
  borderColor: colors.grey200,
  iconColor: colors.coolGrey500,
} satisfies Partial<ButtonProps>;
