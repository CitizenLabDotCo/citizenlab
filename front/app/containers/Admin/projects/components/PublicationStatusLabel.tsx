import React, { memo } from 'react';

// components
import { StatusLabel } from '@citizenlab/cl2-component-library';

// styles
import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// types
import { PublicationStatus } from 'api/projects/types';

interface Props {
  publicationStatus: PublicationStatus;
}

const PublicationStatusLabel = memo<Props>(({ publicationStatus }) => {
  if (publicationStatus !== 'published') {
    const publicationStatusColor = {
      draft: 'orangered',
      archived: colors.red600,
    }[publicationStatus];

    return (
      <StatusLabel
        text={<FormattedMessage {...messages[publicationStatus]} />}
        backgroundColor={publicationStatusColor}
      />
    );
  }

  return null;
});

export default PublicationStatusLabel;
