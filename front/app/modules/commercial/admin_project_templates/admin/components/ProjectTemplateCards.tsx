import React, { memo } from 'react';

import { Spinner, colors, fontSizes } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';

import useLocalize from 'hooks/useLocalize';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import Centerer from 'components/UI/Centerer';
import SearchInput from 'components/UI/SearchInput';

import { injectIntl, FormattedMessage } from 'utils/cl-intl';

import DepartmentFilter from '../components/DepartmentFilter';

import messages from './messages';
import ParticipationLevelFilter from './ParticipationLevelFilter';
import ProjectTemplateCard from './ProjectTemplateCard';
import PurposeFilter from './PurposeFilter';

const Container = styled.div`
  margin-bottom: 15px;
`;

const Filters = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Left = styled.div`
  display: none;
`;

const Spacer = styled.div`
  flex: 1;
`;

const Right = styled.div``;

const StyledSearchInput = styled(SearchInput)`
  width: 300px;
`;

const Cards = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;

const StyledProjectTemplateCard = styled(ProjectTemplateCard)`
  flex-grow: 0;
  width: calc(100% * (1 / 3) - 18px);
  margin-right: 27px;
  margin-bottom: 27px;

  &:nth-child(3n) {
    margin-right: 0px;
  }
`;

const LoadMoreButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 25px;
`;

const LoadMoreButton = styled(ButtonWithLink)``;

const NoTemplates = styled.div`
  width: 100%;
  height: 260px;
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.borderRadius};
`;

interface Props {
  className?: string;
  loading: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
  onSearchChange: (searchValue: string) => void;
  onPurposeFilterChange: (purposes: string[]) => void;
  onDepartmentFilterChange: (departments: string[]) => void;
  onParticipationLevelFilterChange: (participationLevels: string[]) => void;
  templates: {
    edges: [];
    pageInfo: {
      hasNextPage: boolean;
    };
  } | null;
}

const ProjectTemplateCards = memo<Props & WrappedComponentProps>(
  ({
    intl,
    className,
    templates,
    loadingMore,
    loading,
    onLoadMore,
    onSearchChange,
    onPurposeFilterChange,
    onDepartmentFilterChange,
    onParticipationLevelFilterChange,
  }) => {
    const searchPlaceholder = intl.formatMessage(messages.searchPlaceholder);
    const searchAriaLabel = intl.formatMessage(messages.searchPlaceholder);
    const localize = useLocalize();

    return (
      <Container className={className}>
        <Filters>
          <Left>
            <DepartmentFilter onChange={onDepartmentFilterChange} />
            <PurposeFilter onChange={onPurposeFilterChange} />
            <ParticipationLevelFilter
              onChange={onParticipationLevelFilterChange}
            />
          </Left>

          <Spacer />

          <Right>
            <StyledSearchInput
              placeholder={searchPlaceholder}
              ariaLabel={searchAriaLabel}
              onChange={onSearchChange}
              // TODO: Fix this the next time the file is edited.
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              a11y_numberOfSearchResults={templates?.edges.length || 0}
            />
          </Right>
        </Filters>
        {loading && !templates && (
          <Centerer height="500px">
            <Spinner />
          </Centerer>
        )}

        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {templates && templates.edges && templates.edges.length > 0 && (
          <>
            <Cards>
              {templates.edges.map(
                ({
                  node: { id, titleMultiloc, subtitleMultiloc, cardImage },
                }) => {
                  return (
                    <StyledProjectTemplateCard
                      key={id}
                      projectTemplateId={id}
                      imageUrl={cardImage}
                      title={localize(titleMultiloc)}
                      body={localize(subtitleMultiloc)}
                    />
                  );
                }
              )}
            </Cards>

            {get(templates, 'pageInfo.hasNextPage') && (
              <LoadMoreButtonWrapper>
                <LoadMoreButton
                  processing={loadingMore}
                  onClick={onLoadMore}
                  buttonStyle="secondary-outlined"
                >
                  <FormattedMessage {...messages.loadMoreTemplates} />
                </LoadMoreButton>
              </LoadMoreButtonWrapper>
            )}
          </>
        )}

        {/* TODO: Fix this the next time the file is edited. */}
        {/* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition */}
        {templates && templates.edges && templates.edges.length === 0 && (
          <NoTemplates>
            <FormattedMessage {...messages.noTemplatesFound} />
          </NoTemplates>
        )}
      </Container>
    );
  }
);

export default injectIntl(ProjectTemplateCards);
