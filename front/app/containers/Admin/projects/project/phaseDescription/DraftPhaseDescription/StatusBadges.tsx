import React from 'react';

import { Badge, Box, bo, colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { QuillVariant } from 'components/UI/QuillEditor/StyleContainer';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const BoBadge = styled(Badge)`
  && {
    border-radius: ${bo.borderRadius};
  }
`;

interface Props {
  isEditing: boolean;
  variant: QuillVariant;
}

const StatusBadges = ({ isEditing, variant }: Props) => {
  const { formatMessage } = useIntl();
  const StatusBadge = variant === 'bo' ? BoBadge : Badge;

  return (
    <Box as="span" display="inline-flex" alignItems="center" gap="8px">
      <StatusBadge
        as="span"
        color={isEditing ? colors.orange500 : colors.green500}
        className="inverse"
      >
        {formatMessage(
          isEditing
            ? messages.draftDescriptionDraftBadge
            : messages.draftDescriptionPublishedBadge
        )}
      </StatusBadge>
      <StatusBadge as="span" color={colors.coolGrey600} className="inverse">
        {formatMessage(messages.beta)}
      </StatusBadge>
    </Box>
  );
};

export default StatusBadges;
