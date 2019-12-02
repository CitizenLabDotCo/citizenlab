import React from 'react';
import Label from 'components/UI/Label';

export default {
  title: 'Label',
  component: Label,
};

export const normal = () => <Label>Test child text</Label>;

export const withValue = () => <Label value="Test value prop" />;
