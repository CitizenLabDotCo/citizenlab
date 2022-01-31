import React, { memo } from 'react';
import IdeasWithFiltersSidebar from './IdeasWithFiltersSidebar';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// typings
import {
  ParticipationMethod,
  IdeaDefaultSortMethod,
} from 'services/participationContexts';
import { InputProps as GetIdeasInputProps } from 'resources/GetIdeas';
import { MessageDescriptor, IParticipationContextType } from 'typings';

const Container = styled.div`
  width: 100%;
`;

interface Props extends GetIdeasInputProps {
  showViewToggle?: boolean | undefined;
  defaultView?: 'card' | 'map' | null | undefined;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  allowProjectsFilter?: boolean;
  className?: string;
  invisibleTitleMessage?: MessageDescriptor;
}

const IdeaCards = memo<Props>(
  ({ className, invisibleTitleMessage, ...props }) => {
    return (
      <Container className={className || ''}>
        {invisibleTitleMessage && (
          <ScreenReaderOnly>
            <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
          </ScreenReaderOnly>
        )}
        <IdeasWithFiltersSidebar {...props} />
      </Container>
    );
  }
);

export default IdeaCards;
