import { getJwt } from 'utils/auth/jwt';
import {
  ApolloClient,
  HttpLink,
  ApolloLink,
  InMemoryCache,
  concat,
} from '@apollo/client';

const ADMIN_TEMPLATES_GRAPHQL_PATH = '/admin_templates_api/graphql';
const httpLink = new HttpLink({ uri: ADMIN_TEMPLATES_GRAPHQL_PATH });
const authMiddleware = new ApolloLink((operation, forward) => {
  const jwt = getJwt();

  operation.setContext({
    headers: {
      origin: '*',
      authorization: jwt ? `Bearer ${jwt}` : '',
      'Access-Control-Allow-Origin': '*',
    },
    fetchOptions: {
      mode: 'cors',
    },
  });

  return forward(operation);
});

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
});
