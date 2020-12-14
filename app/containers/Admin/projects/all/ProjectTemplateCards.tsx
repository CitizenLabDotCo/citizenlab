import React, { memo, useCallback, useState } from 'react';
import { get, isEmpty } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// graphql
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

// hooks
import useLocalize from 'hooks/useLocalize';
import useGraphqlTenantLocales from 'hooks/useGraphqlTenantLocales';
import useTenant from 'hooks/useTenant';
import useTenantLocales from 'hooks/useTenantLocales';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import ProjectTemplateCard from './ProjectTemplateCard';
import SearchInput from 'components/UI/SearchInput';
import { Spinner } from 'cl2-component-library';
import Button from 'components/UI/Button';
import DepartmentFilter from './DepartmentFilter';
import PurposeFilter from './PurposeFilter';
import ParticipationLevelFilter from './ParticipationLevelFilter';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

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
  color: ${colors.label};
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
}

const ProjectTemplateCards = memo<Props & InjectedIntlProps>(
  ({ intl, className }) => {
    const searchPlaceholder = intl.formatMessage(messages.searchPlaceholder);
    const searchAriaLabel = intl.formatMessage(messages.searchPlaceholder);

    const localize = useLocalize();
    const graphqlTenantLocales = useGraphqlTenantLocales();
    const tenant = useTenant();

    const locales = !isNilOrError(tenant)
      ? tenant.data.attributes.settings.core.locales
      : null;
    const organizationTypes = !isNilOrError(tenant)
      ? tenant.data.attributes.settings.core.organization_type
      : null;

    const [departments, setDepartments] = useState<string[] | null>(null);
    const [purposes, setPurposes] = useState<string[] | null>(null);
    const [participationLevels, setParticipationLevels] = useState<
      string[] | null
    >(null);
    const [search, setSearch] = useState<string | null>(null);
    const [loadingMore, setLoadingMore] = useState(false);

    const TEMPLATES_QUERY = gql`
    query PublishedProjectTemplatesQuery(
      $cursor: String,
      $departments: [ID!],
      $purposes: [ID!],
      $participationLevels: [ID!],
      $search: String,
      $locales: [String!],
      $organizationTypes: [String!]
    ) {
      publishedProjectTemplates(
        first: 24,
        after: $cursor,
        departments: $departments,
        purposes: $purposes,
        participationLevels: $participationLevels,
        search: $search,
        locales: $locales,
        organizationTypes: $organizationTypes
      ) {
        edges {
          node {
            id,
            cardImage,
            titleMultiloc {
              ${graphqlTenantLocales}
            },
            subtitleMultiloc {
              ${graphqlTenantLocales}
            }
          }
          cursor
        }
        pageInfo{
          endCursor
          hasNextPage
        }
      }
    }
  `;

    const tenantLocales = useTenantLocales();
    const { loading, data, fetchMore } = useQuery(TEMPLATES_QUERY, {
      variables: {
        departments,
        purposes,
        participationLevels,
        search,
        organizationTypes,
        cursor: null,
        locales: tenantLocales,
      },
    });

    const templates = get(data, 'publishedProjectTemplates', null);

    const handleDepartmentFilterOnChange = useCallback(
      (departments: string[]) => {
        trackEventByName(tracks.departmentFilterChanged, { departments });
        setDepartments(
          departments && departments.length > 0 ? departments : null
        );
      },
      []
    );

    const handlePurposeFilterOnChange = useCallback((purposes: string[]) => {
      trackEventByName(tracks.purposeFilterChanged, { purposes });
      setPurposes(purposes && purposes.length > 0 ? purposes : null);
    }, []);

    const handleParticipationLevelFilterOnChange = useCallback(
      (participationLevels: string[]) => {
        trackEventByName(tracks.participationLevelFilterChanged, {
          participationLevels,
        });
        setParticipationLevels(
          participationLevels && participationLevels.length > 0
            ? participationLevels
            : null
        );
      },
      []
    );

    const handleSearchOnChange = useCallback((searchValue: string) => {
      trackEventByName(tracks.projectTemplatesSearchValueChanged, {
        searchValue,
      });
      setSearch(!isEmpty(searchValue) ? searchValue : null);
    }, []);

    const handleLoadMoreTemplatesOnClick = useCallback(async () => {
      trackEventByName(tracks.templatesLoadMoreButtonClicked);
      setLoadingMore(true);

      try {
        await fetchMore({
          variables: {
            departments,
            purposes,
            participationLevels,
            search,
            locales,
            organizationTypes,
            cursor: templates.pageInfo.endCursor,
          },
          updateQuery: (
            previousResult,
            { fetchMoreResult }: { fetchMoreResult: any }
          ) => {
            const newEdges = fetchMoreResult.publishedProjectTemplates.edges;
            const pageInfo = fetchMoreResult.publishedProjectTemplates.pageInfo;

            return newEdges.length
              ? {
                  publishedProjectTemplates: {
                    pageInfo,
                    __typename: templates.__typename,
                    edges: [...templates.edges, ...newEdges],
                  },
                }
              : previousResult;
          },
        });
        setLoadingMore(false);
      } catch {
        setLoadingMore(false);
      }
    }, [templates]);

    return (
      <Container className={className}>
        <Filters>
          <Left>
            <DepartmentFilter onChange={handleDepartmentFilterOnChange} />
            <PurposeFilter onChange={handlePurposeFilterOnChange} />
            <ParticipationLevelFilter
              onChange={handleParticipationLevelFilterOnChange}
            />
          </Left>

          <Spacer />

          <Right>
            <StyledSearchInput
              placeholder={searchPlaceholder}
              ariaLabel={searchAriaLabel}
              onChange={handleSearchOnChange}
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
                  onClick={handleLoadMoreTemplatesOnClick}
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
