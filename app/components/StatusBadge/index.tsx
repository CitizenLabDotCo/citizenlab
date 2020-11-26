import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import useIdeaStatus from 'hooks/useIdeaStatus';
import T from 'components/T';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

const Container = styled.div`
  color: #fff;
  font-size: ${fontSizes.xs}px;
  line-height: 16px;
  border-radius: ${(props: any) => props.theme.borderRadius};
  padding: 6px 12px;
  display: inline-block;
  text-transform: uppercase;
  text-align: center;
  font-weight: 600;
  background-color: ${(props: any) => props.color};
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
