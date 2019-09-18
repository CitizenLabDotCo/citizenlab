import React, { memo } from 'react';

// components
import StatusBadge from 'components/StatusBadge';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import {  colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const StatusTitle = styled.h3`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  line-height: 20px;
  font-weight: 300;
  margin: 0;
  margin-bottom: 6px;
  padding: 0;
`;

interface Props {
  statusId: string;
  className?: string;
}

const IdeaStatus = memo<Props>(({ statusId, className }) => {
  return (
    <Container className={className}>
      <StatusTitle><FormattedMessage {...messages.currentStatus} /></StatusTitle>
      <StatusBadge id="e2e-idea-status-badge" statusId={statusId} />
    </Container>
  );
});

export default IdeaStatus;
