const glob = require('glob');
const fs = require('fs');

glob(
  'app/modules/**/index.{ts,tsx}',
  { ignore: ['app/modules/__mocks__/index.ts', 'app/modules/index.ts'] },
  function (error, files) {
    if (error) {
      return error;
    }
    files.forEach((file) => {
      const fileContent = fs.readFileSync(file, 'utf-8');
      let newFileContent = fileContent;

      const defaultImportRegExExcludingReact =
        /import ((?!React)[A-Za-z]+) from \'([A-Za-z0-9./]+)\';/g;

      const importsArray = [
        ...fileContent.matchAll(defaultImportRegExExcludingReact),
      ].map((match) => match[0]);

      const transformedInputArray = importsArray.forEach((defaultImport) => {
        const splitImport = defaultImport.split(' ');

        const importName = splitImport[1];
        const importPath = splitImport[3].replace(';', '');
        const transformedImport = `const ${importName} = React.lazy(() => import(${importPath}));`;
        newFileContent = newFileContent.replace(
          defaultImport,
          transformedImport
        );
      });
      fs.writeFile(file, newFileContent);
    });
  }
);
