const translationMessages = require('../../app/translations/en.json');
const { execSync } = require('child_process');

Object.keys(translationMessages).forEach(messageKey => {
  const lastPartMessageKey = messageKey.match(/[^.]+$/)[0];

  try {
    // requires linux environment
    execSync(`grep -rn --exclude=messages.*s 'app' -e 'messages.${lastPartMessageKey}'`);
  } catch (err) {
    console.log(`unused: ${messageKey}`);
  }
});
