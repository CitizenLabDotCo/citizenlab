import { configure } from '@storybook/react';

configure(require.context('../app', true, /\.stories\.tsx?$/), module);
