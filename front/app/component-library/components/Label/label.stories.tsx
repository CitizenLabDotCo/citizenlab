import React from 'react';

import Label from '.';

export default {
  title: 'Components/Label',
  component: Label,
};

export const Default = {
  render: () => <Label>This is a label</Label>,
  name: 'default',
};

export const WithValueProp = {
  render: () => <Label value="This is a label that uses the value prop" />,
  name: 'with value prop',
};
