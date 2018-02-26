import * as React from 'react';
import * as Rx from 'rxjs';
import { flatten, values } from 'lodash';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IStreamParams } from 'utils/streams';


interface State<IResourceData> {
  resources: {
    [key:number]: IResourceData[];
  };
  currentPage: number;
  lastPage: number;
}


export interface InjectedNestedResourceLoaderProps<IResourceData> {
  [key: string]: {
    all: IResourceData[],
    currentPage: number,
    lastPage: number,
    loadMore: () => void,
    hasMore: () => boolean,
  };
}

interface IStreamFn {
  (parentId: string, streamParams: IStreamParams);
}

interface IParentIdFn {
  (props: any): string;
}

export const injectNestedResources = function <IResourceData>(propName: string, streamFn: IStreamFn, parentIdFn: IParentIdFn) {
  return <TOriginalProps extends {}>(WrappedComponent: React.ComponentClass<TOriginalProps & InjectedNestedResourceLoaderProps<IResourceData>>) => {
    return class ResourceManager extends React.Component<TOriginalProps, State<IResourceData>> {

      subscriptions: Rx.Subscription[] = [];

      constructor(props) {
        super(props);
        this.state = {
          resources: {},
          currentPage: 0,
          lastPage: 0,
        };
      }

      componentWillReceiveProps(nextProps) {
        const prevProps = this.props;
        if (parentIdFn(nextProps) && parentIdFn(nextProps) !== parentIdFn(prevProps)) {
          this.setState({
            resources: {},
            currentPage: 0,
            lastPage: 0,
          }, this.loadMore);
        }
      }

      componentDidMount() {
        this.loadMore();
      }

      componentWillUnmount() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      }

      loadMore() {
        const parentId = parentIdFn(this.props);
        if (parentId) {
          this.subscriptions.push(
            streamFn(parentId, {
              queryParameters: {
                'page[number]': this.state.currentPage + 1,
                'page[size]': 24,
              }
            }).observable.subscribe((data) => {
              const currentPage = getPageNumberFromUrl(data && data.links && data.links.self) || 1;
              const lastPage = getPageNumberFromUrl(data && data.links && data.links.last) || currentPage;
              this.setState({
                currentPage,
                lastPage,
                resources: { ...this.state.resources, [currentPage]: data.data },
              });
            })
          );
        }
      }

      hasMore() {
        return this.state.lastPage > this.state.currentPage;
      }

      render() {
        const injectedProps = {
          [propName]: {
            all: flatten(values(this.state.resources)),
            currentPage: this.state.currentPage,
            lastPage: this.state.lastPage,
            loadMore: this.loadMore,
            hasMore: this.hasMore,
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
};
