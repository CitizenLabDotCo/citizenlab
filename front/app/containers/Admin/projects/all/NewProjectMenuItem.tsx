import React from 'react';

import {
  DropdownListItem,
  Icon,
  IconNames,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

const Item = styled(DropdownListItem)`
  gap: 10px;
  margin-bottom: 0;
  font-size: ${bo.headerFontSize};
  color: ${bo.colors.textHeadingStrong};

  &:hover,
  &:focus {
    background: ${colors.grey100};
  }
`;

interface Props {
  icon: IconNames;
  label: string;
  onClick: () => void;
}

const NewProjectMenuItem = ({ icon, label, onClick }: Props) => (
  <Item type="button" role="menuitem" onClick={onClick}>
    <Icon
      name={icon}
      width="16px"
      height="16px"
      fill={colors.coolGrey500}
      aria-hidden
    />
    {label}
  </Item>
);

export default NewProjectMenuItem;
