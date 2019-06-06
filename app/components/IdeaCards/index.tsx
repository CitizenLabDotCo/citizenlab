import React, { memo } from 'react';

// components
import WithFiltersSidebar from './WithFiltersSidebar';
import WithoutFiltersSidebar from './WithoutFiltersSidebar';

// styling
import styled from 'styled-components';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { InputProps as GetIdeasInputProps } from 'resources/GetIdeas';

const Container = styled.div`
  width: 100%;
`;

interface Props extends GetIdeasInputProps  {
  showViewToggle?: boolean | undefined;
  defaultView?: 'card' | 'map' | null | undefined;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: 'Phase' | 'Project' | null;
  allowProjectsFilter?: boolean;
  showFiltersSidebar?: boolean;
  className?: string;
}

const IdeaCards = memo<Props>((props) => {
  return (
    <Container className={props.className}>
      {props.showFiltersSidebar ? <WithFiltersSidebar {...props} /> : <WithoutFiltersSidebar {...props} />}
    </Container>
  );
});

export default IdeaCards;
