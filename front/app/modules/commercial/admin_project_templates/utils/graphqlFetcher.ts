interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
}

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string; path?: string[] }>;
}

const ADMIN_TEMPLATES_GRAPHQL_PATH = '/admin_templates_api/graphql';

export const graphqlFetcher = async <TData = any>({
  query,
  variables,
}: GraphQLRequest): Promise<TData> => {
  const response = await fetch(ADMIN_TEMPLATES_GRAPHQL_PATH, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: '*',
      'Access-Control-Allow-Origin': '*',
    },
    mode: 'cors',
    // The auth cookie authenticates the request
    credentials: 'include',
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const result: GraphQLResponse<TData> = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error');
  }

  return result.data!;
};
