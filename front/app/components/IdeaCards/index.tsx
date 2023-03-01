import React, { lazy, Suspense, memo } from 'react';

// components
const IdeasWithFiltersSidebar = lazy(() => import('./IdeasWithFiltersSidebar'));
const IdeasWithoutFiltersSidebar = lazy(
  () => import('./IdeasWithoutFiltersSidebar')
);

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { FormattedMessage } from 'utils/cl-intl';

// typings
import { PublicationStatus as ProjectPublicationStatus } from 'services/projects';
import {
  ParticipationMethod,
  IdeaDefaultSortMethod,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';
import { MessageDescriptor } from 'react-intl';

const Container = styled.div`
  width: 100%;
`;

interface Props {
  // idea query
  phaseId?: string;
  authorId?: string;
  projectPublicationStatus?: ProjectPublicationStatus;

  // shared
  projectId?: string;

  // other
  showViewToggle?: boolean | undefined;
  defaultView?: 'card' | 'map' | null | undefined;
  defaultSortingMethod?: IdeaDefaultSortMethod;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
  allowProjectsFilter?: boolean;
  hideFiltersSidebar?: boolean;
  className?: string;
  invisibleTitleMessage?: MessageDescriptor;
}

const IdeaCards = memo<Props>(
  ({
    className,
    invisibleTitleMessage,
    hideFiltersSidebar = false,
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
          {hideFiltersSidebar ? (
            <IdeasWithoutFiltersSidebar {...props} />
          ) : (
            <IdeasWithFiltersSidebar {...props} />
          )}
        </Suspense>
      </Container>
    );
  }
);

export default IdeaCards;
