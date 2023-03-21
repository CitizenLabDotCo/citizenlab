import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.DisabledAccount.title',
    defaultMessage: 'Your account has been temporarily disabled',
  },
  text: {
    id: 'app.containers.DisabledAccount.text',
    defaultMessage:
      'Your account on Greenville Participation Platform has been temporarily disabled for a violation of the community guideline. For more information on this, you can consult the Terms & conditions.',
  },
  bottomText: {
    id: 'app.containers.DisabledAccount.bottomText',
    defaultMessage: 'You can sign in again from {date}.',
  },
});
