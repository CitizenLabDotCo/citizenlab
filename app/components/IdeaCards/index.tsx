import React, { lazy, Suspense, memo } from 'react';

// components
const WithFiltersSidebar = lazy(() => import('./WithFiltersSidebar'));
const WithoutFiltersSidebar = lazy(() => import('./WithoutFiltersSidebar'));

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
  showFiltersSidebar?: boolean;
  className?: string;
  invisibleTitleMessage: MessageDescriptor;
}

const IdeaCards = memo<Props>(
  ({ className, invisibleTitleMessage, ...props }) => {
    return (
      <Container className={className || ''}>
        <ScreenReaderOnly>
          <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
        </ScreenReaderOnly>
        <Suspense fallback={null}>
          {props.showFiltersSidebar ? (
            <WithFiltersSidebar {...props} />
          ) : (
            <WithoutFiltersSidebar {...props} />
          )}
        </Suspense>
      </Container>
    );
  }
);

export default IdeaCards;
