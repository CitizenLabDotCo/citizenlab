import { configure, addDecorator } from '@storybook/react';

// automatically import all files ending in *.stories.tsx
const req = require.context('../app', true, /.stories.tsx$/);

function loadStories() {
  req.keys().forEach(req);
}

configure(loadStories, module);
