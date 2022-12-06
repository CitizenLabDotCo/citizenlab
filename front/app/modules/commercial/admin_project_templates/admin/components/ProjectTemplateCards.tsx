import React, { memo } from 'react';
import { WrappedComponentProps } from 'react-intl';
import { Spinner } from '@citizenlab/cl2-component-library';
import { get } from 'lodash-es';
// hooks
import useLocalize from 'hooks/useLocalize';
// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { colors, fontSizes } from 'utils/styleUtils';
import DepartmentFilter from '../components/DepartmentFilter';
import Button from 'components/UI/Button';
import SearchInput from 'components/UI/SearchInput';
// style
import styled from 'styled-components';
import ParticipationLevelFilter from './ParticipationLevelFilter';
// components
import ProjectTemplateCard from './ProjectTemplateCard';
import PurposeFilter from './PurposeFilter';
import messages from './messages';

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

const SpinnerWrapper = styled.div`
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
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

const LoadMoreButton = styled(Button)``;

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
              a11y_numberOfSearchResults={templates?.edges.length || 0}
            />
          </Right>
        </Filters>

        {loading && !templates && (
          <SpinnerWrapper>
            <Spinner />
          </SpinnerWrapper>
        )}

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
                  buttonStyle="secondary"
                >
                  <FormattedMessage {...messages.loadMoreTemplates} />
                </LoadMoreButton>
              </LoadMoreButtonWrapper>
            )}
          </>
        )}

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
