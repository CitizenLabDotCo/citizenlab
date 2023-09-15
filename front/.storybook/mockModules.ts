import path from "path";

const appFolder = path.join(process.cwd(), 'app');

const mockModules = {
  'services/locale': path.resolve(path.join(appFolder, 'services', '__mocks__', 'locale')),
  'modules': path.resolve(path.join(appFolder, 'modules', '__mocks__', 'index')),
}

export default mockModules;
