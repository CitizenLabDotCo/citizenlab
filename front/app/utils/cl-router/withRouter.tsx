import React from 'react';
import {
  useLocation,
  // eslint-disable-next-line no-restricted-imports
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

export interface WithRouterProps {
  location: ReturnType<typeof useLocation> & { query: Record<string, any> };
  params: Record<string, string>;
  navigate: ReturnType<typeof useNavigate>;
}

export const withRouter = (Component: React.ComponentType<any>) => {
  return (props: any) => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // normally you have to do searchParams.get('key'),
    // we create a normal key/value object here and pass it down
    const searchParamsObj = {};
    for (const queryParamsPair of searchParams.entries()) {
      const [key, val] = queryParamsPair;
      searchParamsObj[key] = val;
    }

    return (
      <Component
        location={{ ...location, query: searchParamsObj }}
        params={params}
        navigate={navigate}
        {...props}
      />
    );
  };
};
