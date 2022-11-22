const glob = require('glob');
const fs = require('fs');

glob(
  'app/modules/*/*/index.{ts,tsx}',
  { ignore: ['app/modules/__mocks__/index.ts', 'app/modules/index.ts'] },
  function (error, files) {
    if (error) {
      return error;
    }
    files.forEach((file) => {
      const fileContent = fs.readFileSync(file, 'utf-8');
      // Check if file uses React
      if (fileContent.includes('import React')) {
        let newFileContent = fileContent;

        const defaultImportRegExExcludingReactMessagesHooks =
          /import ((?!React)(?!messages)(?!use*)(?!CustomFieldsStep)[A-Za-z]+) from \'([A-Za-z0-9./]+)\';/g;

        const defaultImportsArray = [
          ...fileContent.matchAll(
            defaultImportRegExExcludingReactMessagesHooks
          ),
        ].map((match) => match[0]);

        const transformedInputArray = defaultImportsArray.forEach(
          (defaultImport) => {
            const splitImport = defaultImport.split(' ');
            const importName = splitImport[1];
            const importPath = splitImport[3].replace(';', '');
            const transformedImport = `const ${importName} = React.lazy(() => import(${importPath}));`;
            newFileContent = newFileContent.replace(
              defaultImport,
              transformedImport
            );
          }
        );
        fs.writeFileSync(file, newFileContent);
      }
    });
  }
);
