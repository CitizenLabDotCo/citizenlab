import useAppConfiguration from 'hooks/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';
import React, { lazy, memo, Suspense } from 'react';
import { isNilOrError } from 'utils/helperUtils';
// components
const IdeasWithFiltersSidebar = lazy(() => import('./IdeasWithFiltersSidebar'));
const IdeasWithoutFiltersSidebar = lazy(
  () => import('./IdeasWithoutFiltersSidebar')
);

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

// i18n
import { FormattedMessage, MessageDescriptor } from 'react-intl';

// typings
import { InputProps as GetIdeasInputProps } from 'resources/GetIdeas';
import {
  IdeaDefaultSortMethod,
  ParticipationMethod,
} from 'services/participationContexts';
import { IParticipationContextType } from 'typings';

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
    const localize = useLocalize();
    const appConfig = useAppConfiguration();

    if (!isNilOrError(appConfig)) {
      return (
        <Container className={className || ''}>
          {invisibleTitleMessage && (
            <ScreenReaderOnly>
              <FormattedMessage
                tagName="h2"
                {...invisibleTitleMessage}
                values={{
                  orgName: localize(
                    appConfig.attributes.settings.core.organization_name
                  ),
                }}
              />
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

    return null;
  }
);

export default IdeaCards;
