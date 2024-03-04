import React from 'react';

import {
  Box,
  media,
  Button,
  Spinner,
  useBreakpoint,
} from '@citizenlab/cl2-component-library';
import { rgba } from 'polished';
import styled, { useTheme } from 'styled-components';

import IdeaCard from 'components/IdeaCard';

import { FormattedMessage } from 'utils/cl-intl';

import { IIdeaData } from 'api/ideas/types';

import messages from '../../messages';

import EmptyIdeas from './EmptyIdeas';

const Footer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;

  ${media.phone`
    flex-direction: column;
    align-items: stretch;
    margin-top: 0px;
  `}
`;

const Loading = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  ${media.desktop`
    height: calc(100vh - 280px);
    position: sticky;
    top: 200px;
  `}

  ${media.phone`
    height: 150px;
  `}
`;

interface Props {
  id: string;
  hasIdeas: boolean;
  hasMore: boolean;
  querying: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  list: IIdeaData[] | null;
  ariaLabelledBy?: string;
  tabIndex?: number;
  hideImage?: boolean;
  hideImagePlaceholder?: boolean;
  hideIdeaStatus?: boolean;
  phaseId?: string;
}

const IdeasList = ({
  id,
  querying,
  onLoadMore,
  hasIdeas,
  hasMore,
  loadingMore,
  list,
  ariaLabelledBy,
  tabIndex,
  hideImage = false,
  hideImagePlaceholder = false,
  hideIdeaStatus = false,
  phaseId,
}: Props) => {
  const theme = useTheme();
  const smallerThanPhone = useBreakpoint('phone');
  const loadMoreIdeas = () => {
    onLoadMore();
  };

  return (
    <div aria-labelledby={ariaLabelledBy} id={id} tabIndex={tabIndex}>
      {querying ? (
        <Loading>
          <Spinner />
        </Loading>
      ) : (
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
                  <Box
                    key={idea.id}
                    flex-grow="0"
                    margin="10px"
                    width={smallerThanPhone ? '100%' : 'calc(50% - 20px)'}
                  >
                    <IdeaCard
                      ideaId={idea.id}
                      phaseId={phaseId}
                      hideImage={hideImage}
                      hideImagePlaceholder={hideImagePlaceholder}
                      hideIdeaStatus={hideIdeaStatus}
                    />
                  </Box>
                );
              })}
            </Box>
          )}

          {hasMore && (
            <Footer>
              <Button
                id="e2e-idea-cards-show-more-button"
                onClick={loadMoreIdeas}
                buttonStyle="secondary"
                text={<FormattedMessage {...messages.showMore} />}
                processing={loadingMore}
                height="50px"
                icon="refresh"
                iconPos="left"
                textColor={theme.colors.tenantText}
                bgColor={rgba(theme.colors.tenantText, 0.08)}
                bgHoverColor={rgba(theme.colors.tenantText, 0.12)}
                fontWeight="500"
              />
            </Footer>
          )}

          {!hasIdeas && <EmptyIdeas />}
        </>
      )}
    </div>
  );
};

export default IdeasList;
