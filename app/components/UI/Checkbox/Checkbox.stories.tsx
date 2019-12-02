import React from 'react';
import Checkbox from 'components/UI/Checkbox';
import { action } from '@storybook/addon-actions';

export default {
  title: 'Checkbox',
  component: Checkbox,
  includeStories: []
};

export const checked = () => <Checkbox checked={true} label="Checked" onChange={action('checkbox-toggled')} />;

export const unchecked = () => <Checkbox checked={false} label="Unchecked" onChange={action('checkbox-toggled')} />;
