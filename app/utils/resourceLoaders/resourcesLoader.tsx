import * as React from 'react';
import * as Rx from 'rxjs';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IStreamParams, IStream } from 'utils/streams';


interface State<IResourceData> {
  resources: IResourceData[] | undefined;
  currentPage: number;
  lastPage: number;
  loading: boolean;
}


export interface InjectedResourcesLoaderProps<IResourceData> {
  [key: string]: {
    all: IResourceData[] | undefined,
    currentPage: number,
    lastPage: number,
    loadMore: () => void,
    hasMore: () => boolean,
    loading: boolean,
  };
}

interface TStreamFn<IResources> {
  (streamParams: IStreamParams<IResources> | null): IStream<IResources>;
}

interface IIResources<IResourceData> {
  data: IResourceData[];
  links?: {
    self?: number;
    last?: number;
  };
}

export const injectResources = <IResourceData, IResources extends IIResources<IResourceData>>(propName: string, streamFn: TStreamFn<IResources>) =>
  <TOriginalProps extends {}>(WrappedComponent: React.ComponentClass<TOriginalProps & InjectedResourcesLoaderProps<IResourceData>>) => {
    return class ResourceManager extends React.Component<TOriginalProps, State<IResourceData>> {

      subscriptions: Rx.Subscription[] = [];

      constructor(props) {
        super(props);
        this.state = {
          resources: undefined,
          currentPage: 0,
          lastPage: 0,
          loading: true,
        };
      }

      componentDidMount() {
        this.loadMore();
      }

      componentWillUnmount() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      }

      loadMore() {
        this.setState({ loading: true });
        this.subscriptions.push(
          streamFn({queryParameters: {
            'page[number]': this.state.currentPage + 1,
            'page[size]': 24,
          }}).observable.subscribe((data) => {
            this.setState({ loading: false });
            const currentPage = getPageNumberFromUrl(data && data.links && data.links.self) || 1;
            const lastPage = getPageNumberFromUrl(data && data.links && data.links.last) || currentPage;
            this.setState({
              currentPage,
              lastPage,
              resources: (this.state.resources || []).concat(data.data),
            });
          }, undefined, () => this.setState({ loading: false }))
        );
      }

      hasMore() {
        return this.state.lastPage > this.state.currentPage;
      }

      render() {
        const injectedProps = {
          [propName]: {
            all: this.state.resources,
            currentPage: this.state.currentPage,
            lastPage: this.state.lastPage,
            loadMore: this.loadMore,
            hasMore: this.hasMore,
            loading: this.state.loading,
          },
        };

        return (
          <WrappedComponent
            {...this.props}
            {...injectedProps}
          />
        );
      }
    };
};

