import React from 'react';

import {
  colors,
  fontSizes,
  Spinner,
  Icon,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IIdeaMarkers } from 'api/idea_markers/types';

import Centerer from 'components/UI/Centerer';

import { FormattedMessage } from 'utils/cl-intl';

import IdeaMapCard from '../IdeaMapCard';
import messages from '../messages';

const IdeaMapCardContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding-top: 20px;
  overflow-x: hidden;
  overflow-y: auto;
`;

const StyledIdeaMapCard = styled(IdeaMapCard)`
  margin-left: 20px;
  margin-right: 20px;
`;

const EmptyContainer = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 100px;
  margin-bottom: 100px;
`;

const IdeaIcon = styled(Icon)`
  flex: 0 0 26px;
  width: 26px;
  height: 26px;
  fill: ${colors.textSecondary};
`;

const EmptyMessage = styled.div`
  padding-left: 50px;
  padding-right: 50px;
  margin-top: 12px;
  margin-bottom: 30px;
`;

const EmptyMessageLine = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  line-height: normal;
  text-align: center;
`;

type Props = {
  ideaMarkers: IIdeaMarkers | undefined;
  projectId: string;
  phaseId?: string;
  isFiltered: boolean;
  onSelectIdea: (ideaId: string) => void;
};

const IdeaMapCards = ({
  ideaMarkers,
  projectId,
  phaseId,
  isFiltered,
  onSelectIdea,
}: Props) => {
  return (
    <IdeaMapCardContainer id="e2e-idea-map-cards">
      {ideaMarkers === undefined && (
        <Centerer>
          <Spinner />
        </Centerer>
      )}
      {ideaMarkers &&
        ideaMarkers.data.length > 0 &&
        ideaMarkers.data.map((ideaMarker) => (
          <StyledIdeaMapCard
            projectId={projectId}
            idea={ideaMarker}
            key={ideaMarker.id}
            phaseId={phaseId}
            onSelectIdea={onSelectIdea}
          />
        ))}

      {!ideaMarkers ||
        (ideaMarkers.data.length === 0 && (
          <EmptyContainer>
            <IdeaIcon ariaHidden name="idea" />
            <EmptyMessage>
              <EmptyMessageLine>
                <FormattedMessage
                  {...(isFiltered
                    ? messages.noFilteredResults
                    : messages.noResults)}
                />
              </EmptyMessageLine>
            </EmptyMessage>
          </EmptyContainer>
        ))}
    </IdeaMapCardContainer>
  );
};

export default IdeaMapCards;
