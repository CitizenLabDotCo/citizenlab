import path from 'path';

const appFolder = path.join(process.cwd(), 'app');
const rel = (...args: string[]) => path.resolve(path.join(appFolder, ...args));

const mockModules = {
  // The shared test mock, plus what the language selector needs.
  'utils/locale': path.join(process.cwd(), '.storybook', 'mocks', 'locale'),
  modules: rel('modules', '__mocks__', 'index'),
  // The shared test mock, with typedStyled applying the styles.
  'utils/cl-router/Link': path.join(
    process.cwd(),
    '.storybook',
    'mocks',
    'Link'
  ),
  'components/admin/ContentBuilder/useCraftComponentDefaultPadding': rel(
    'components',
    'admin',
    'ContentBuilder',
    '__mocks__',
    'useCraftComponentDefaultPadding'
  ),
  '@researchgate/react-intersection-observer': path.join(
    process.cwd(),
    '__mocks__',
    'react-intersection-observer'
  ),
};

export default mockModules;
