import React, { memo } from 'react';

import { StatusLabel, colors } from '@citizenlab/cl2-component-library';

import { PublicationStatus } from 'api/projects/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

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
