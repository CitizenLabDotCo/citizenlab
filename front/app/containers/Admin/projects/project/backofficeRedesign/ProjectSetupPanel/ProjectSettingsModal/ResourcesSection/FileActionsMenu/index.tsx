import React from 'react';

import IconButton from 'design-system/IconButton';
import Menu, { MenuItem, MenuTrigger } from 'design-system/Menu';
import 'design-system/tokens.css';

export interface FileAction {
  name: string;
  label: string;
  onClick: () => void;
}

interface Props {
  ariaLabel: string;
  actions: FileAction[];
}

const FileActionsMenu = ({ ariaLabel, actions }: Props) => (
  <MenuTrigger>
    <IconButton icon="more-horizontal-16" aria-label={ariaLabel} />
    <Menu aria-label={ariaLabel} placement="bottom end">
      {actions.map(({ name, label, onClick }) => (
        <MenuItem key={name} id={name} onAction={onClick}>
          {label}
        </MenuItem>
      ))}
    </Menu>
  </MenuTrigger>
);

export default FileActionsMenu;
