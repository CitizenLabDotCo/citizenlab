import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';

import { IIdeaMarkerData } from 'api/idea_markers/types';

import clHistory from 'utils/cl-router/history';

import IdeaMapCard from '../IdeaMapCard';
import { mapHeightMobile } from '../utils';

// Note: Existing custom styling
const StyledIdeaMapCard = styled(IdeaMapCard)<{ isClickable: boolean }>`
  width: calc(100% - 24px);
  position: absolute;
  top: calc(${mapHeightMobile} - 220px - 24px);
  left: 12px;
  right: 12px;
  z-index: 1001;
  pointer-events: ${(props) => (props.isClickable ? 'auto' : 'none')};
  transition: opacity 300ms cubic-bezier(0.19, 1, 0.22, 1),
    top 300ms cubic-bezier(0.19, 1, 0.22, 1);

  &.animation-enter {
    opacity: 0;

    &.animation-enter-active {
      opacity: 1;
    }
  }
`;

type Props = {
  selectedIdea: string | null;
  setSelectedIdea: (ideaId: string | null) => void;
  selectedIdeaData: IIdeaMarkerData | undefined;
  projectId: string;
  phaseId?: string;
};
const MobileIdeaOverlay = ({
  selectedIdea,
  setSelectedIdea,
  selectedIdeaData,
  projectId,
  phaseId,
}: Props) => {
  return (
    <CSSTransition classNames="animation" in={!!selectedIdea} timeout={300}>
      <Box>
        {selectedIdeaData && (
          <StyledIdeaMapCard
            idea={selectedIdeaData}
            onClose={() => {
              setSelectedIdea(null);
            }}
            onSelectIdea={(ideaId: string) => {
              clHistory.push(
                `/ideas/${selectedIdeaData.attributes.slug}?go_back=true`,
                {
                  scrollToTop: true,
                }
              );
              setSelectedIdea(ideaId);
            }}
            isClickable={true}
            projectId={projectId}
            phaseId={phaseId}
          />
        )}
      </Box>
    </CSSTransition>
  );
};

export default MobileIdeaOverlay;
