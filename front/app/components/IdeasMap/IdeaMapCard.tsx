import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// events
import { selectIdeaId } from './events';

// hooks
import useIdea from 'hooks/useIdea';

import T from 'components/T';

// styling
import styled from 'styled-components';
import { defaultCardStyle } from 'utils/styleUtils';

const Container = styled.div`
  padding: 20px;
  margin-bottom: 20px;
  background: #fff;
  ${defaultCardStyle};
  border: solid 1px #ccc;
  cursor: pointer;

  &:hover {
    border-color: #000;
  }
`;

interface Props {
  ideaId: string;
  className?: string;
}

const IdeaMapCard = memo<Props>(({ ideaId, className }) => {
  const idea = useIdea({ ideaId });

  const handleOnClick = (event: React.FormEvent) => {
    event?.preventDefault();
    selectIdeaId(ideaId);
  };

  if (!isNilOrError(idea)) {
    return (
      <Container className={className || ''} onClick={handleOnClick}>
        <T value={idea.attributes.title_multiloc} />
        <div>Upvotes: {idea.attributes.upvotes_count}</div>
        <div>Location: {idea.attributes.location_description}</div>
      </Container>
    );
  }

  return null;
});

export default IdeaMapCard;
