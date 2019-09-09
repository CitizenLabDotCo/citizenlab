import React, { memo, useCallback } from 'react';
import { Provider, createClient, useQuery } from 'urql';
import { GRAPHQL_PATH } from 'containers/App/constants';

// components
import ProjectTemplateCard from './ProjectTemplateCard';
import SearchInput from 'components/UI/SearchInput';

// style
import styled from 'styled-components';
import DepartmentFilter from './DepartmentFilter';

const Container = styled.div`
  /* margin-right: -13px;
  margin-left: -13px;
  margin-bottom: -26px; */
  border: solid 1px red;
`;

const Filters = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  border: solid 1px red;
  /* margin-left: 13px;
  margin-right: 13px; */
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
  border: solid 1px red;
`;

const StyledProjectTemplateCard = styled(ProjectTemplateCard)`
  flex-grow: 0;
  width: calc(100% * (1/3));
`;

interface Props {
  className?: string;
}

// const searchPlaceholder = this.props.intl.formatMessage(messages.searchPlaceholder);
// const searchAriaLabel = this.props.intl.formatMessage(messages.searchPlaceholder);

const ProjectTemplateCards = memo<Props>(({ className }) => {

  const [{ fetching, data }] = useQuery({
    query: `{
      publishedProjectTemplates {
        nodes {
          id,
          cardImage,
          titleMultiloc {
            en
          },
          subtitleMultiloc {
            en
          }
        }
      }
    }`,
  });

  const handleDepartmentFilterOnChange = useCallback(() => {
    // empty
  }, []);

  const handleSearchOnChange = useCallback(() => {
    // empty
  }, []);

  if (!fetching) {
    return (
      <Container className={className}>
        <Filters>
          <Left>
            <DepartmentFilter onChange={handleDepartmentFilterOnChange} />
          </Left>

          <Right>
            <StyledSearchInput
              className="e2e-search-ideas-input"
              // placeholder={this.searchPlaceholder}
              // ariaLabel={this.searchAriaLabel}
              value={null}
              onChange={handleSearchOnChange}
            />
          </Right>
        </Filters>

        <Cards>
          {data.publishedProjectTemplates.nodes.map(({ id, titleMultiloc, subtitleMultiloc, cardImage }, index) => {
            return (
              <StyledProjectTemplateCard
                key={id}
                className={(index + 1) % 3 === 0 ? 'noRightMargin' : ''}
                imageUrl={cardImage}
                title={titleMultiloc.en}
                body={subtitleMultiloc.en}
              />
            );
          })}
        </Cards>
      </Container>
    );
  }

  return null;
});

const client = createClient({
  url: GRAPHQL_PATH
});

export default () => (
  <Provider value={client}>
    <ProjectTemplateCards />
  </Provider>
);
