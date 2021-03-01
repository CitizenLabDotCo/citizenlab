import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useIdeaStatus from 'hooks/useIdeaStatus';
import T from 'components/T';
import styled from 'styled-components';
import { transparentize } from 'polished';
import { fontSizes } from 'utils/styleUtils';

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
  background: ${({ color }) => transparentize(0.91, color)};
  border-radius: ${({ theme }) => theme.borderRadius};
`;

interface Props {
  statusId: string;
  className?: string;
  id?: string;
}

const StatusBadge = memo<Props>(({ statusId, id, className }) => {
  const ideaStatus = useIdeaStatus({ statusId });

  if (!isNilOrError(ideaStatus)) {
    const color = ideaStatus?.attributes?.color || '#bbb';

    return (
      <Container id={id || ''} className={className || ''} color={color}>
        <T value={ideaStatus.attributes.title_multiloc} />
      </Container>
    );
  }

  return null;
});

export default StatusBadge;
