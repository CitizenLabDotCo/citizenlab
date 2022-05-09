import React from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';

export interface WithRouterProps {
  history: {
    back: () => void;
    goBack: () => void;
    location: ReturnType<typeof useLocation>;
    push: (url: string, state?: any) => void;
  };
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

    const history = {
      back: () => navigate(-1),
      goBack: () => navigate(-1),
      location,
      push: (url: string, state?: any) => navigate(url, { state }),
      replace: (url: string, state?: any) =>
        navigate(url, {
          replace: true,
          state,
        }),
    };

    return (
      <Component
        history={history}
        location={{ ...location, query: searchParams }}
        params={params}
        navigate={navigate}
        {...props}
      />
    );
  };
};
