import React, { memo } from 'react';
import useIdeaStatus from 'api/idea_statuses/useIdeaStatus';
import T from 'components/T';
import styled from 'styled-components';
import { transparentize } from 'polished';
import { fontSizes } from '@citizenlab/cl2-component-library';

const Container = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: ${fontSizes.xs}px;
  font-weight: 600;
  text-transform: uppercase;
  text-align: center;
  line-height: normal;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  padding: 5px 8px;
  display: inline-block;
  border-radius: ${({ theme }) => theme.borderRadius};
  border: 1px solid ${({ color }) => transparentize(0.7, color)};
`;

interface Props {
  statusId: string;
  className?: string;
  id?: string;
}

const StatusBadge = memo<Props>(({ statusId, id, className }) => {
  const { data: ideaStatus } = useIdeaStatus(statusId);

  if (ideaStatus) {
    const color = ideaStatus?.data.attributes?.color || '#bbb';

    return (
      <Container id={id} className={className || ''} color={color}>
        <T value={ideaStatus.data.attributes.title_multiloc} />
      </Container>
    );
  }

  return null;
});

export default StatusBadge;
