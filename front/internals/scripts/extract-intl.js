/**
 * This script will extract the internationalization messages from all components
   and package them in the translation json files in the translations file.
 */

const fs = require('fs');
const mkdir = require('shelljs').mkdir;
const babel = require('babel-core');
const { globPromise, readFilePromise, writeFilePromise } = require('./helpers/promisify');
const animateProgress = require('./helpers/progress');
const addCheckmark = require('./helpers/checkmark');
const constants = require('../../app/containers/App/constants');
const locales = Object.keys(constants.appLocalePairs);
const newLine = () => process.stdout.write('\n');
let progress;

const task = (message) => {
  progress = animateProgress(message);
  process.stdout.write(message);

  return (error) => {
    if (error) {
      process.stderr.write(error);
    }
    clearTimeout(progress);
    return addCheckmark(() => newLine());
  };
};

const generateLocaleMappings = (
  outputFolder,
  oldLocaleMappings,
  localeMappings
) => {
  // Loop to run once per locale
  for (const locale of locales) {
    oldLocaleMappings[locale] = {};
    localeMappings[locale] = {};
    // File to store translation messages into
    const translationFileName = `${outputFolder}${locale}.json`;
    try {
      // Parse the old translation message JSON files
      const messages = JSON.parse(fs.readFileSync(translationFileName, 'utf8'));
      const messageKeys = Object.keys(messages);
      for (const messageKey of messageKeys) {
        oldLocaleMappings[locale][messageKey] = messages[messageKey];
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        process.stderr.write(
          `There was an error loading this translation file: ${translationFileName}
        \n${error}`
        );
      }
    }
  }
  return { oldLocaleMappings, localeMappings };
};

const extractFromFile = async (fileName, localeMappings, oldLocaleMappings) => {
  try {
    const codeToTransform = await readFilePromise(fileName);
    const options = { plugins: ['react-intl'], filename: fileName };
    const { metadata } = await babel.transform(codeToTransform, options);

    if (metadata && metadata['react-intl'] && metadata['react-intl'].messages) {
      for (const message of metadata['react-intl'].messages) {
        for (const locale of locales) {
          const oldLocaleMapping = oldLocaleMappings[locale][message.id];

          // We don't allow duplicate definitions, so let's throw an error if we already came accross this one
          if (localeMappings[locale][message.id]) {
            throw new Error(
              `Duplicate definition found for id '${message.id}'`
            );
          }

          if (oldLocaleMapping) {
            localeMappings[locale][message.id] = oldLocaleMapping;
          } else if (locale === constants.DEFAULT_LOCALE) {
            localeMappings[locale][message.id] = message.defaultMessage;
          }
        }
      }
    }
  } catch (error) {
    process.stderr.write(`Error transforming file: ${fileName}\n${error}\n`);
    throw new Error(`Error transforming file: ${fileName}\n${error}`);
  }
};

async function extractMessages(inputGlob, ignoreGlob, outputFolder) {
  const { oldLocaleMappings, localeMappings } = generateLocaleMappings(
    outputFolder,
    [],
    []
  );

  const memoryTaskDone = task('Storing language files in memory');
  const messagesFiles = await globPromise(inputGlob, ignoreGlob);
  memoryTaskDone();

  const extractTaskDone = task('Run extraction on all files\n');
  // Run extraction on all files that match the glob on line 16
  try {
    await Promise.all(
      messagesFiles.map((fileName) =>
        extractFromFile(fileName, localeMappings, oldLocaleMappings)
      )
    );
    extractTaskDone();
  } catch (error) {
    process.stderr.write(
      'Some messages.js files contain errors. First fix them and run the script again.'
    );
    process.exit(1);
  }

  // Make the directory if it doesn't exist, especially for first run
  mkdir('-p', outputFolder);

  for (const locale of locales) {
    const translationFileName = `${outputFolder}${locale}.json`;
    const localeTaskDone = task(
      `Writing translation messages for ${locale} to: ${translationFileName}`
    );

    try {
      // Sort the translation JSON file so that git diffing is easier
      // Otherwise the translation messages will jump around every time we extract
      const messages = {};

      Object.keys(localeMappings[locale])
        .sort()
        .forEach((key) => {
          messages[key] = localeMappings[locale][key];
        });

      // Write to file the JSON representation of the translation messages
      const prettified = `${JSON.stringify(messages, null, 2)}\n`;

      await writeFilePromise(translationFileName, prettified);

      localeTaskDone();
    } catch (error) {
      localeTaskDone(
        `There was an error saving this translation file: ${translationFileName}
        \n${error}`
      );
    }
  }
}

(async function main() {
  await extractMessages(
    'app/**/messages.*s',
    'app/**/{a,A}dmin/**/messages.*s',
    'app/translations/'
  );
  await extractMessages(
    'app/**/{a,A}dmin/**/messages.*s',
    '',
    'app/translations/admin/'
  );
  process.exit();
})();
