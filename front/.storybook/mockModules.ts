import path from 'path';

const appFolder = path.join(process.cwd(), 'app');
const rel = (...args: string[]) => path.resolve(path.join(appFolder, ...args));

const mockModules = {
  'utils/locale': rel('utils', '__mocks__', 'locale'),
  modules: rel('modules', '__mocks__', 'index'),
  'utils/cl-router/Link': rel('utils', 'cl-router', '__mocks__', 'Link'),
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
