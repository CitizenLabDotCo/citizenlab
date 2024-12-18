import React from 'react';

import { media } from '@citizenlab/cl2-component-library';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import { Sticky } from '../..';

import InfoSidebarMulti from './InfoSidebarMulti';
import InfoSidebarSingle from './InfoSidebarSingle';

const RightColumn = styled.div`
  max-width: 200px;
  display: flex;

  ${media.tablet`
    display: none;
  `}

  &.slide-enter {
    transform: translateX(100%);
    opacity: 0;

    &.slide-enter-active {
      transition: 200ms;
      transform: translateX(0%);
      opacity: 1;
    }
  }

  &.slide-exit {
    transition: 200ms;
    transform: translateX(0%);
    opacity: 1;

    &.slide-exit-active {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;

export const StyledLink = styled.a`
  cursor: pointer;
  &:hover,
  &:focus {
    text-decoration: underline;
  }
`;

export function handlePreviewCLick(
  id: string,
  openPreview: (id: string) => void
) {
  return function () {
    openPreview(id);
  };
}

interface Props {
  selection: Set<string>;
  openPreview: (id: string) => void;
}

const InfoSidebar = ({ selection, openPreview }: Props) => {
  const postIds = [...selection];

  return (
    <CSSTransition
      in={postIds.length !== 0}
      mountOnEnter={true}
      unmountOnExit={true}
      timeout={200}
      classNames="slide"
    >
      <RightColumn>
        <Sticky>
          {postIds.length > 1 ? (
            <InfoSidebarMulti postIds={postIds} openPreview={openPreview} />
          ) : (
            <InfoSidebarSingle postId={postIds[0]} openPreview={openPreview} />
          )}
        </Sticky>
      </RightColumn>
    </CSSTransition>
  );
};

export default InfoSidebar;
