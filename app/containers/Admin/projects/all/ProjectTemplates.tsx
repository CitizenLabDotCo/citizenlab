import React, { memo } from 'react';
import { Provider, createClient, useQuery } from 'urql';
import { GRAPHQL_PATH } from 'containers/App/constants';

// style
import styled from 'styled-components';

const Loading = styled.div`
  width: 100%;
  height: 100px;
  background: red;
`;

const List = styled.div`
  width: 100%;
  height: 100px;
  background: green;
`;

interface Props { }

const ProjectTemplates = memo<Props>((_props) => {

  const [{ fetching, data }] = useQuery({
    query: `
      {
        publishedProjectTemplates {
          edges {
            node {
              id
              titleMultiloc {
                en
              }
              subtitleMultiloc {
                en
              }
              descriptionMultiloc {
                en
              }
              publicationStatus
              cardImage
              headerImage
            }
          }
        }
      }
    `,
  });

  console.log(data);

  return fetching ? <Loading /> : <List />;
});

const client = createClient({
  url: GRAPHQL_PATH
});

export default () => (
  <Provider value={client}>
    <ProjectTemplates />}
  </Provider>
);
