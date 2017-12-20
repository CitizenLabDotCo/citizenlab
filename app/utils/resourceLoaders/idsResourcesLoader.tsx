import * as React from 'react';
import * as Rx from 'rxjs';
import { getPageNumberFromUrl } from 'utils/paginationUtils';
import { IStreamParams, IStream } from 'utils/streams';


interface State<IResourceData> {
  resources: IResourceData[];
}

export interface InjectedResourcesByIdsProps<IResourceData> {
  [key: string]: IResourceData[];
}

interface IStreamFn<IResource> {
  (resourceId: string): IStream<IResource>;
}

interface IResourcesIdsFn {
  (props: any): string[];
}

interface IIResource<IResourceData> {
  data: IResourceData;
}

type TOriginalProps = {
  [key: string]: any;
};

export const injectResourcesByIds = <IResourceData, IResource extends IIResource<IResourceData>>(propName: string, streamFn: IStreamFn<IResource>, resourceIdsFn: IResourcesIdsFn) =>
  (WrappedComponent: React.ComponentClass<TOriginalProps & InjectedResourcesByIdsProps<IResourceData>>) => {
    return class ResourceManager extends React.Component<TOriginalProps, State<IResourceData>> {

      subscriptions: Rx.Subscription[] = [];

      constructor(props) {
        super(props);
        this.state = {
          resources: []
        };
      }

      componentWillReceiveProps(nextProps) {
        if (resourceIdsFn(nextProps) !== resourceIdsFn(this.props)) {
          this.setState({
            resources: [],
          }, this.loadResources);
        }
      }

      componentDidMount() {
        this.loadResources();
      }

      componentWillUnmount() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
      }

      loadResources() {
        this.subscriptions.forEach((subscription) => subscription.unsubscribe());
        const ids = resourceIdsFn(this.props);
        if (ids) {
          const resourceObservables = ids.map((id) => {
            return streamFn(id).observable;
          });
          this.subscriptions = [
            Rx.Observable.combineLatest(resourceObservables).subscribe((resources) => {
              this.setState({
                resources: resources.map((r) => r.data),
              });
            })
          ];
        }
      }

      render() {
        const injectedProps = {
          [propName]: this.state.resources
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

