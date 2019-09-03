const findInFiles = require('find-in-files');
const translationMessages = require('../../app/translations/en.json');

Object.keys(translationMessages).forEach(messageKey => {
  const lastPartMessageKey = messageKey.match(/[^.]+$/)[0];
  findInFiles.find(`messages.${lastPartMessageKey}`, 'app', /^(?!messages).*\.(js|ts|tsx)$/).then(mathces => {
    const filesThatUseMessageKey = [];
    for (const match in matches) {
      const res = matches[match];
      filesThatUseMessageKey.push(res);
    }

    if (filesThatUseMessageKey.length === 0) {
      console.log(messageKey);
    }
  });

});
