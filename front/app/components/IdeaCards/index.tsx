import React, { lazy, Suspense, memo } from 'react';
import { MessageDescriptor } from 'react-intl';
// styling
import styled from 'styled-components';
import { IParticipationContextType } from 'typings';
import { InputProps as GetIdeasInputProps } from 'resources/GetIdeas';
// typings
import {
  ParticipationMethod,
  IdeaDefaultSortMethod,
} from 'services/participationContexts';
import { ScreenReaderOnly } from 'utils/a11y';
// i18n
import { FormattedMessage } from 'utils/cl-intl';

// components
const IdeasWithFiltersSidebar = lazy(() => import('./IdeasWithFiltersSidebar'));
const IdeasWithoutFiltersSidebar = lazy(
  () => import('./IdeasWithoutFiltersSidebar')
);

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
  showFiltersSidebar?: boolean;
  className?: string;
  invisibleTitleMessage?: MessageDescriptor;
  projectId?: string;
}

const IdeaCards = memo<Props>(
  ({
    className,
    invisibleTitleMessage,
    showFiltersSidebar = false,
    ...props
  }) => {
    return (
      <Container className={className || ''}>
        {invisibleTitleMessage && (
          <ScreenReaderOnly>
            <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
          </ScreenReaderOnly>
        )}
        <Suspense fallback={null}>
          {showFiltersSidebar ? (
            <IdeasWithFiltersSidebar {...props} />
          ) : (
            <IdeasWithoutFiltersSidebar {...props} />
          )}
        </Suspense>
      </Container>
    );
  }
);

export default IdeaCards;
