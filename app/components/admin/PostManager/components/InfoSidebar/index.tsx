import React from 'react';
import InfoSidebarSingle from './InfoSidebarSingle';
import InfoSidebarMulti from './InfoSidebarMulti';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { Sticky } from '../..';

const RightColumn = styled.div`
  max-width: 200px;
  display: flex;

  ${media.smallerThan1280px`
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

export function handlePreviewCLick(id, openPreview) {
  return function () {
    openPreview(id);
  };
}

interface Props {
  postIds: string[];
  openPreview: (id: string) => void;
}

export default ({ postIds, openPreview }: Props) => (
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
