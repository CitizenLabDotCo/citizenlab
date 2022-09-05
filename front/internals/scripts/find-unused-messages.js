const translationMessages = require('../../app/translations/en.json');
const { execSync } = require('child_process');

// • There are many false alarms, because the script searches for messages.key usage,
//   so variations with messages[${}] etc. don't get checked.
//   So it's not 20% of the copy that was not used, it was probably closer to 10-12% if I have to guesstimate.
// • Some unused messages may not get reported, because a similar key is used elsewhere, so they do not get reported.
// • Some reportedly unused messages are very hard to check whether they're used or not.
//   E.g. most of the messages in the Error component are reported to be unused,
//   but this is false because the message keys are generated programatically (resulting in the problem described in the first bullet point).
//   However, some of them could be unused, but it's time consuming to check whether they're used. (edited)

Object.keys(translationMessages).forEach((messageKey) => {
  const lastPartMessageKey = messageKey.match(/[^.]+$/)[0];

  try {
    // requires linux environment
    execSync(
      `grep -rn --exclude=messages.*s 'app' -e 'messages.${lastPartMessageKey}'`
    );
  } catch (err) {
    console.log(`unused: ${messageKey}`);
  }
});
