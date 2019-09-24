import React, { memo } from 'react';

// components
import WithFiltersSidebar from './WithFiltersSidebar';
import WithoutFiltersSidebar from './WithoutFiltersSidebar';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly }from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { ParticipationMethod } from 'services/participationContexts';
import { InputProps as GetIdeasInputProps } from 'resources/GetIdeas';
import { MessageDescriptor } from 'typings';

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
  invisibleTitleMessage: MessageDescriptor;
}

const IdeaCards = memo<Props>(({ className, invisibleTitleMessage, ...props }) => {
  return (
    <Container className={className}>
      <ScreenReaderOnly>
        <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
      </ScreenReaderOnly>
      {props.showFiltersSidebar ? <WithFiltersSidebar {...props} /> : <WithoutFiltersSidebar {...props} />}
    </Container>
  );
});

export default IdeaCards;
