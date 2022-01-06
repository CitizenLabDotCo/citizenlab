import { defineMessages } from 'react-intl';

export default defineMessages({
  requiredError: {
    id: 'app.components.CustomFieldsForm.requiredError',
    defaultMessage: 'This field is required',
  },
  optional: {
    id: 'app.components.CustomFieldsForm.optional',
    defaultMessage: '(optional)',
  },
  mustBeANumber: {
    id: 'app.components.CustomFieldsForm.mustBeANumber',
    defaultMessage: 'This field expects a number',
  },
  blockedVerified: {
    id: 'app.components.CustomFieldsForm.blockedVerified',
    defaultMessage:
      "You can't edit this field because it contains verified informtion",
  },
});
