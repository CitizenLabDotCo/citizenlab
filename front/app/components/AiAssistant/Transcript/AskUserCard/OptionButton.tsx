import React from 'react';

import ButtonWithLink from 'components/UI/ButtonWithLink';

type Props = {
  label: string;
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
};

const OptionButton = ({ label, selected, disabled, onClick }: Props) => (
  <ButtonWithLink
    type="button"
    buttonStyle={selected ? 'bo-primary' : 'bo-picker'}
    height="30px"
    padding="0 12px"
    borderRadius="999px"
    whiteSpace="normal"
    icon={selected ? 'check' : undefined}
    ariaPressed={selected}
    disabled={disabled}
    onClick={onClick}
  >
    {label}
  </ButtonWithLink>
);

export default OptionButton;
