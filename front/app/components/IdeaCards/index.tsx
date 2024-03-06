import React, { lazy, Suspense } from 'react';

const IdeasWithFiltersSidebar = lazy(() => import('./IdeasWithFiltersSidebar'));
const IdeasWithoutFiltersSidebar = lazy(
  () => import('./IdeasWithoutFiltersSidebar')
);
import { MessageDescriptor } from 'react-intl';
import styled from 'styled-components';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import { Props as WithSidebarProps } from './IdeasWithFiltersSidebar';
import { Props as WithoutSidebarProps } from './IdeasWithoutFiltersSidebar';

const Container = styled.div`
  width: 100%;
`;

interface WrapperProps {
  className?: string;
  invisibleTitleMessage?: MessageDescriptor;
  children: React.ReactNode;
}

const Wrapper = ({
  children,
  className,
  invisibleTitleMessage,
}: WrapperProps) => (
  <Container className={className || ''}>
    {invisibleTitleMessage && (
      <ScreenReaderOnly>
        <FormattedMessage tagName="h2" {...invisibleTitleMessage} />
      </ScreenReaderOnly>
    )}
    <Suspense fallback={null}>{children}</Suspense>
  </Container>
);

type IdeaCardsWithFiltersSidebarProps = Omit<WrapperProps, 'children'> &
  WithSidebarProps;

export const IdeaCardsWithFiltersSidebar = ({
  className,
  invisibleTitleMessage,
  ...ideaCardsProps
}: IdeaCardsWithFiltersSidebarProps) => (
  <Wrapper className={className} invisibleTitleMessage={invisibleTitleMessage}>
    <IdeasWithFiltersSidebar {...ideaCardsProps} />
  </Wrapper>
);

type IdeaCardsWithoutFiltersSidebarProps = Omit<WrapperProps, 'children'> &
  WithoutSidebarProps;

export const IdeaCardsWithoutFiltersSidebar = ({
  className,
  invisibleTitleMessage,
  ...ideaCardsProps
}: IdeaCardsWithoutFiltersSidebarProps) => (
  <Wrapper className={className} invisibleTitleMessage={invisibleTitleMessage}>
    <IdeasWithoutFiltersSidebar {...ideaCardsProps} />
  </Wrapper>
);
