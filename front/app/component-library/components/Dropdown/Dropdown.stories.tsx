import React from 'react';

import { action } from '@storybook/addon-actions';
import { boolean } from '@storybook/addon-knobs';

import Dropdown, { DropdownListItem } from './';

export default {
  title: 'Components/Dropdown',
  component: Dropdown,
};

export const Default = {
  render: () => (
    <div
      style={{
        position: 'relative',
      }}
    >
      <Dropdown
        opened={boolean('Opened', true)}
        onClickOutside={action('clicked outside')}
        content={
          <>
            <DropdownListItem key={1}>Item 1</DropdownListItem>
            <DropdownListItem key={2}>Item 2</DropdownListItem>
            <DropdownListItem key={3}>Item 3</DropdownListItem>
          </>
        }
      />
    </div>
  ),

  name: 'default',
};
