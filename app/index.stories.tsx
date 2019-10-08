import React from 'react';
import Label from 'components/UI/Label';
import { storiesOf } from '@storybook/react';

storiesOf('Label', module).add('with text', () => (
  <Label>Test</Label>
));
