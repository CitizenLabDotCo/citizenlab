import { defineMessages } from 'react-intl';

export default defineMessages({
  errorMaxSizeExceeded: {
    id: 'app.components.Upload.errorMaxSizeExceeded',
    defaultMessage: 'One or more files exceed the maximum allowed filesize of {maxFileSize} Mb',
  },
  errorMaxItemCountExceeded: {
    id: 'app.components.Upload.errorMaxItemCountExceeded',
    defaultMessage: 'Maximum number of files exceeded',
  },
});
