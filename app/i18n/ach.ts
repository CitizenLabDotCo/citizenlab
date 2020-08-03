import { addLocaleData } from 'react-intl';
import achLocaleData from 'utils/ach';

let translationMessages = {};

if (process.env.CROWDIN_PLUGIN_ENABLED) {
  addLocaleData(achLocaleData as any);

  const achTranslationMessages = require('translations/ach-UG.json');

  const formatTranslationMessages = (messages) => {
    const defaultFormattedMessages = formatTranslationMessages(
      achTranslationMessages
    );

    return Object.keys(messages).reduce((formattedMessages, key) => {
      let message = messages[key];
      if (!message) {
        message = defaultFormattedMessages[key];
      }
      return Object.assign(formattedMessages, { [key]: message });
    }, {});
  };

  translationMessages = formatTranslationMessages(achTranslationMessages);
  document.write(
    '<script type="text/javascript">var _jipt = [];_jipt.push(["project", "cl2-front"]);</script>'
  );
  document.write(
    '<script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js"></script>'
  );
}

export default translationMessages;
