import React, { memo } from 'react';

// components
import StatusBadge from 'components/StatusBadge';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

const Container = styled.div``;

const StatusTitle = styled.div<{ tagName: string }>`
  ${({ tagName }) => tagName} {
    color: ${colors.label};
    font-size: ${fontSizes.base}px;
    line-height: normal;
    font-weight: 300;
  }

  margin: 0;
  margin-bottom: 7px;
  padding: 0;
`;

interface Props {
  statusId: string;
  className?: string;
  tagName: 'h3' | 'h2';
}

const IdeaStatus = memo<Props>(({ statusId, className, tagName }) => {
  return (
    <Container className={className}>
      <StatusTitle tagName={tagName}>
        <FormattedMessage tagName={tagName} {...messages.currentStatus} />
      </StatusTitle>
      <StatusBadge id="e2e-idea-status-badge" statusId={statusId} />
    </Container>
  );
});

export default IdeaStatus;
