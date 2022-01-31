import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  Box,
  media,
  Button,
  useWindowSize,
  viewportWidths,
  Spinner,
} from '@citizenlab/cl2-component-library';
import IdeaCard from 'components/IdeaCard';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { rgba } from 'polished';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { ParticipationMethod } from 'services/participationContexts';
import EmptyIdeas from './EmptyIdeas';
import { IIdeaData } from 'services/ideas';
import { IParticipationContextType } from 'typings';

const StyledIdeaCard = styled(IdeaCard)`
  flex-grow: 0;
  width: calc(50% - 20px);
  margin: 10px;

  ${media.smallerThan1100px`
    width: 100%;
  `};
`;

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;

  ${media.smallerThanMinTablet`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const ShowMoreButton = styled(Button)``;

const Loading = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.biggerThanMinTablet`
    height: calc(100vh - 280px);
    position: sticky;
    top: 200px;
  `}

  ${media.smallerThanMinTablet`
    height: 150px;
  `}
`;

interface Props {
  hasIdeas: boolean;
  hasMore: boolean;
  querying: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  list: IIdeaData[] | null;
  participationMethod?: ParticipationMethod | null;
  participationContextId?: string | null;
  participationContextType?: IParticipationContextType | null;
}

const IdeasList = ({
  querying,
  onLoadMore,
  hasIdeas,
  hasMore,
  loadingMore,
  list,
  participationMethod,
  participationContextId,
  participationContextType,
}: Props) => {
  const theme: any = useTheme();
  const { windowWidth } = useWindowSize();
  const locale = useLocale();

  const biggerThanLargeTablet = windowWidth >= viewportWidths.largeTablet;
  const smallerThan1440px = windowWidth <= 1440;
  const smallerThanPhone = windowWidth <= viewportWidths.phone;

  const loadMoreIdeas = () => {
    onLoadMore();
  };

  if (!isNilOrError(locale)) {
    if (querying) {
      return (
        <Loading id="ideas-loading">
          <Spinner />
        </Loading>
      );
    } else {
      return (
        <>
          {hasIdeas && list && (
            <Box
              ml="-13px"
              mr="-13px"
              mt="-10px"
              display="flex"
              flexWrap="wrap"
              id="e2e-ideas-list"
            >
              {list.map((idea) => {
                return (
                  <StyledIdeaCard
                    key={idea.id}
                    ideaId={idea.id}
                    participationMethod={participationMethod}
                    participationContextId={participationContextId}
                    participationContextType={participationContextType}
                    hideImage={biggerThanLargeTablet && smallerThan1440px}
                    hideImagePlaceholder={smallerThan1440px}
                    hideIdeaStatus={
                      !!(
                        (biggerThanLargeTablet && smallerThan1440px) ||
                        smallerThanPhone
                      )
                    }
                  />
                );
              })}
            </Box>
          )}

          {hasMore && (
            <Footer>
              <ShowMoreButton
                locale={locale}
                id="e2e-idea-cards-show-more-button"
                onClick={loadMoreIdeas}
                buttonStyle="secondary"
                text={<FormattedMessage {...messages.showMore} />}
                processing={loadingMore}
                height="50px"
                icon="showMore"
                iconPos="left"
                textColor={theme.colorText}
                bgColor={rgba(theme.colorText, 0.08)}
                bgHoverColor={rgba(theme.colorText, 0.12)}
                fontWeight="500"
              />
            </Footer>
          )}

          {!hasIdeas && <EmptyIdeas />}
        </>
      );
    }
  }

  return null;
};

export default IdeasList;
