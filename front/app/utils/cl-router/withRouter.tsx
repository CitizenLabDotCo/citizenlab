import React from 'react';
import {
  useLocation,
  // eslint-disable-next-line no-restricted-imports
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

/** @deprecated Use `React Router hooks` instead */
export interface WithRouterProps {
  location: ReturnType<typeof useLocation> & { query: Record<string, any> };
  params: Record<string, string>;
  navigate: ReturnType<typeof useNavigate>;
}

/** @deprecated Use `React Router hooks` instead */
export const withRouter = <T extends WithRouterProps = WithRouterProps>(
  Component: React.ComponentType<T>
) => {
  return (props: Omit<T, keyof WithRouterProps>) => {
    const location = useLocation();
    const params = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // normally you have to do searchParams.get('key'),
    // we create a normal key/value object here and pass it down
    const searchParamsObj = {};
    for (const queryParamsPair of searchParams.entries()) {
      const [key, val] = queryParamsPair;

      if (searchParamsObj[key] !== undefined) {
        if (Array.isArray(searchParamsObj[key])) {
          searchParamsObj[key].push(val);
        } else {
          const previousValue = searchParamsObj[key];
          searchParamsObj[key] = [previousValue, val];
        }
      } else {
        searchParamsObj[key] = val;
      }
    }

    return (
      <Component
        {...(props as T)}
        location={{ ...location, query: searchParamsObj }}
        params={params}
        navigate={navigate}
      />
    );
  };
};
