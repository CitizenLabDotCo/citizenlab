import React from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
  URLSearchParams,
} from 'react-router-dom';

export interface CLWithRouterProps<T = ReturnType<typeof useParams>> {
  history: {
    back: () => void;
    goBack: () => void;
    location: ReturnType<typeof useLocation>;
    push: (url: string, state?: any) => void;
  };
  location: ReturnType<typeof useLocation>;
  params: {
    params: T;
  };
  navigate: ReturnType<typeof useNavigate>;
  searchParams: any;
}

export const CLWithRouter = <P extends object>(Component: any) => {
  return (props: Omit<P, keyof CLWithRouterProps>) => {
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
        location={location}
        params={params}
        navigate={navigate}
        searchParams={searchParams}
        {...(props as P)}
      />
    );
  };
};
