import React from 'react';

import {
  Box,
  defaultCardHoverStyle,
  defaultCardStyle,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import { IIdeaMarkers } from 'api/idea_markers/types';

import HorizontalScroll from 'components/HorizontalScroll';
import T from 'components/T';

import { useIntl } from 'utils/cl-intl';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

import messages from './messages';

const IdeaCard = styled(Box)`
  ${defaultCardStyle};
  flex-shrink: 0;

  &:hover {
    ${defaultCardHoverStyle};
    transform: translate(0px, 0px);
    cursor: pointer;
  }
`;

const IdeaTitle = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Container = styled.div`
  width: 100%;
  padding: 20px;
  margin-top: 4px;
  ${defaultCardStyle};
`;

interface Props {
  ideaMarkers?: IIdeaMarkers;
  onSelectIdea: (ideaId: string | null) => void;
}

const MobileIdeaNav = ({ ideaMarkers, onSelectIdea }: Props) => {
  const theme = useTheme();
  const { formatMessage } = useIntl();

  return (
    <Container>
      {ideaMarkers && ideaMarkers?.data?.length > 0 ? (
        <>
          <Title color="tenantText" my="8px" variant="h6">
            {formatMessage(messages.ideaNavigationDescription)}
          </Title>
          <HorizontalScroll>
            <ul
              style={{ display: 'flex', listStyleType: 'none', padding: '0px' }}
            >
              {ideaMarkers.data.map((ideaMarker) => (
                <li
                  key={ideaMarker.id}
                  style={{
                    minWidth: '200px',
                  }}
                  tabIndex={0}
                  onClick={() => {
                    updateSearchParams({ idea_map_id: ideaMarker.id });
                    onSelectIdea(ideaMarker.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateSearchParams({ idea_map_id: ideaMarker.id });
                      onSelectIdea(ideaMarker.id);
                    }
                  }}
                >
                  <IdeaCard
                    display="flex"
                    flexDirection={theme.isRtl ? 'row-reverse' : 'row'}
                    borderLeft={
                      !theme.isRtl
                        ? `4px solid ${theme.colors.tenantPrimary}`
                        : undefined
                    }
                    borderRight={
                      theme.isRtl
                        ? `4px solid ${theme.colors.tenantPrimary}`
                        : undefined
                    }
                    h="58px"
                    py="4px"
                  >
                    <IdeaTitle
                      m="0px"
                      ml="12px"
                      fontSize="s"
                      maxWidth="200px"
                      style={{ fontWeight: 600 }}
                      my="auto"
                      color="tenantText"
                    >
                      <T value={ideaMarker.attributes.title_multiloc} />
                    </IdeaTitle>
                  </IdeaCard>
                </li>
              ))}
            </ul>
          </HorizontalScroll>
        </>
      ) : (
        formatMessage(messages.noFilteredResults)
      )}
    </Container>
  );
};

export default MobileIdeaNav;
