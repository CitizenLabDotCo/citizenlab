import React, { memo, useCallback } from 'react';
import { Provider, createClient, useQuery } from 'urql';
import gql from 'graphql-tag';
import { GRAPHQL_PATH } from 'containers/App/constants';

// components
import ProjectTemplateCard from './ProjectTemplateCard';
import SearchInput from 'components/UI/SearchInput';
import Button from 'components/UI/Button';

// i18n
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import DepartmentFilter from './DepartmentFilter';

const Container = styled.div``;

const Filters = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
`;

const Left = styled.div``;

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
  width: calc(100% * (1/3) - 18px);
  margin-right: 27px;

  &:nth-child(3n) {
    margin-right: 0px;
  }
`;

const LoadMoreButtonWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
`;

const LoadMoreButton = styled(Button)``;

interface Props {
  className?: string;
}

const ProjectTemplateCards = memo<Props & InjectedIntlProps>(({ intl, className }) => {

  const searchPlaceholder = intl.formatMessage(messages.searchPlaceholder);
  const searchAriaLabel = intl.formatMessage(messages.searchPlaceholder);

  const templates = gql`
    query PublishedProjectTemplatesQuery($first: Int!, $after: String) {
      publishedProjectTemplates(first: $first, after: $after) {
        edges {
          node {
            id,
            cardImage,
            titleMultiloc {
              en
            },
            subtitleMultiloc {
              en
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

  // data.publishedProjectTemplates.pageInfo.endCursor

  const [{ fetching, data }] = useQuery({
    query: templates,
    variables: {
      first: 2
    }
  });

  const handleDepartmentFilterOnChange = useCallback(() => {
    // empty
  }, []);

  const handleSearchOnChange = useCallback(() => {
    // empty
  }, []);

  const handleLoadMoreTemplatesOnClick = useCallback(() => {
    // empty
  }, []);

  if (!fetching) {
    return (
      <Container className={className}>
        <Filters>
          <Left>
            <DepartmentFilter onChange={handleDepartmentFilterOnChange} />
            <DepartmentFilter onChange={handleDepartmentFilterOnChange} />
            <DepartmentFilter onChange={handleDepartmentFilterOnChange} />
          </Left>

          <Right>
            <StyledSearchInput
              className="e2e-search-ideas-input"
              placeholder={searchPlaceholder}
              ariaLabel={searchAriaLabel}
              value={null}
              onChange={handleSearchOnChange}
            />
          </Right>
        </Filters>

        <Cards>
          {data.publishedProjectTemplates.edges.map(({ node: { id, titleMultiloc, subtitleMultiloc, cardImage } }) => {
            return (
              <StyledProjectTemplateCard
                key={id}
                imageUrl={cardImage}
                title={titleMultiloc.en}
                body={subtitleMultiloc.en}
              />
            );
          })}
        </Cards>

        <LoadMoreButtonWrapper>
          <LoadMoreButton
            onClick={handleLoadMoreTemplatesOnClick}
            style="secondary"
            // fullWidth={true}
            // bgColor={darken(0.05, colors.lightGreyishBlue)}
            // bgHoverColor={darken(0.1, colors.lightGreyishBlue)}
          >
            <FormattedMessage {...messages.loadMoreTemplates} />
          </LoadMoreButton>
        </LoadMoreButtonWrapper>

      </Container>
    );
  }

  return null;
});

const client = createClient({
  url: GRAPHQL_PATH
});

const ProjectTemplateCardsWithHoc = injectIntl(ProjectTemplateCards);

export default () => (
  <Provider value={client}>
    <ProjectTemplateCardsWithHoc />
  </Provider>
);
