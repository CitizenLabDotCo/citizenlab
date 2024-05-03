import React, { memo } from 'react';

import { StatusLabel, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { PublicationStatus } from 'api/projects/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  publicationStatus: PublicationStatus;
}

const StyledStatusLabel = styled(StatusLabel)`
  padding-left: 4px;
  padding-right: 4px;
  height: 20px;
  font-weight: bold;
  font-size: 10px;
`;

const PublicationStatusLabel = memo<Props>(({ publicationStatus }) => {
  if (publicationStatus !== 'published') {
    const publicationStatusColor = {
      draft: 'orangered',
      archived: colors.red600,
    }[publicationStatus];

    return (
      <StyledStatusLabel
        text={<FormattedMessage {...messages[publicationStatus]} />}
        backgroundColor={publicationStatusColor}
      />
    );
  }

  return null;
});

export default PublicationStatusLabel;
