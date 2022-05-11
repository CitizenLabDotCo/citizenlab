import React from 'react';
import {
  useLocation,
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

    return (
      <Component
        location={{ ...location, query: searchParams }}
        params={params}
        navigate={navigate}
        {...props}
      />
    );
  };
};
