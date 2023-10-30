import path from "path";

const appFolder = path.join(process.cwd(), 'app');
const rel = (...args: string[]) => path.resolve(path.join(appFolder, ...args));

const mockModules = {
  'utils/locale': rel('utils', '__mocks__', 'locale'),
  'modules': rel('modules', '__mocks__', 'index'),
  'utils/cl-router/Link': rel('utils', 'cl-router', '__mocks__', 'Link'),
  '@researchgate/react-intersection-observer': path.join(
    process.cwd(), '__mocks__', 'react-intersection-observer'
  ),
  polished: path.resolve('./node_modules/polished'),
  moment: path.resolve('./node_modules/moment'),
  react: path.resolve('./node_modules/react'),
  'styled-components': path.resolve('./node_modules/styled-components'),
  'react-transition-group': path.resolve(
    './node_modules/react-transition-group'
  ),
}

export default mockModules;
