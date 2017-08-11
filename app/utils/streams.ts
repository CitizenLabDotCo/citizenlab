import { injectIntl } from 'react-intl';
import 'whatwg-fetch';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';

export type pureFn<T> = (arg: T) => T;
type fetchFn<T> = () => IStream<T>;
interface IObject{ [key: string]: any; }
export type IObserver<T> = Rx.Observer<T | pureFn<T> | null>;
export type IObservable<T> = Rx.Observable<T>;
export interface IStreamParams<T> {
  bodyData?: IObject | null;
  httpMethod?: IObject | null;
  queryParameters?: IObject | null;
  localProperties?: IObject | null;
  onEachEmit?: pureFn<T> | null;
  requestedDataId?: string | null;
  forceRemoteFetch?: boolean;
}
interface IInputStreamParams<T> extends IStreamParams<T> {
  apiEndpoint: string;
}
interface IExtendedStreamParams<T> {
  apiEndpoint: string;
  bodyData: IObject | null;
  httpMethod: IObject | null;
  queryParameters: IObject | null;
  localProperties: IObject | null;
  onEachEmit: pureFn<T> | null;
  requestedDataId: string | null;
  forceRemoteFetch: boolean;
}
export interface IStream<T> {
  id: string;
  params: IExtendedStreamParams<T>;
  type: 'singleObject' | 'arrayOfObjects' | 'unknown';
  fetch: fetchFn<T>;
  observer: IObserver<T> | null;
  observable: IObservable<T>;
  // data: T | null;
  dataIds: { [key: string]: true };
}

class Streams {
  public streams: { [key: string]: IStream<any>};
  private resources: { [key: string]: any };

  constructor() {
    this.streams = {};
    this.resources = {};
  }

  findExistingStreamId(params: IExtendedStreamParams<any>) {
    let existingStreamId: string | null = null;

    _.forOwn(this.streams, (stream, streamId) => {
      if (_.isEqual(stream.params, params)) {
        existingStreamId = streamId;
        return false;
      }

      return true;
    });

    return existingStreamId;
  }

  create<T>(inputParams: IInputStreamParams<T>) {
    const params: IExtendedStreamParams<T> = {
      bodyData: null,
      httpMethod: null,
      queryParameters: null,
      localProperties: null,
      onEachEmit: null,
      requestedDataId: null,
      forceRemoteFetch: false,
      ...inputParams
    };

    const existingStreamId = this.findExistingStreamId(params);

    if (!_.isString(existingStreamId)) {
      const streamId = uuid();

      this.streams[streamId] = {
        params,
        id: streamId,
        type: 'unknown',
        fetch: null as any,
        observer: null,
        observable: null as any,
        // data: null,
        dataIds: {},
      };

      this.streams[streamId].fetch = () => {
        const { apiEndpoint, bodyData, httpMethod, queryParameters } = this.streams[streamId].params;

        request<any>(apiEndpoint, bodyData, httpMethod, queryParameters).then((response) => {
          (this.streams[streamId].observer as IObserver<any>).next(response);
        }).catch(() => {
          console.log(`promise for api endpoint ${apiEndpoint} did not resolve`);
          (this.streams[streamId].observer as IObserver<any>).next(null);
        });

        return this.streams[streamId];
      };

      this.streams[streamId].observable = Rx.Observable.create((observer: IObserver<T>) => {
        const { apiEndpoint, requestedDataId, forceRemoteFetch } = this.streams[streamId].params;

        this.streams[streamId].observer = observer;

        if (_.isString(requestedDataId) && !_.isUndefined(this.resources[requestedDataId]) && !forceRemoteFetch) {
          (this.streams[streamId].observer as IObserver<any>).next(this.resources[requestedDataId]);
        } else {
          this.streams[streamId].fetch();
        }

        return () => {
          console.log(`stream for api endpoint ${apiEndpoint} completed`);
          delete this.streams[streamId];
        };
      })
      .startWith('initial')
      .scan((accumulated: T, current: T | pureFn<T>) => {
        let data: any = accumulated;
        const dataIds = {};
        const { onEachEmit, localProperties } = this.streams[streamId].params;

        if (_.isFunction(onEachEmit)) {
          data = onEachEmit(data);
        }

        if (!_.isFunction(current) && localProperties !== null) {
          if (_.isArray(current)) {
            data = <any>current.map((child) => ({ ...child, ...localProperties }));
          } else if (_.isObject(current)) {
            data = { ...<any>current, ...localProperties };
          } else {
            console.log('current is no Object or Array');
          }
        } else if (_.isFunction(current)) {
          data = current(data);
        } else {
          data = current;
        }

        if (_.isObject(data) && !_.isEmpty(data)) {
          const innerData = data.data;
          const included = (data.included ? data.included : null);

          if (_.isArray(innerData)) {
            this.streams[streamId].type = 'arrayOfObjects';

            _(innerData).filter(item => item.id).forEach((item) => {
              dataIds[item.id] = true;
              this.resources[item.id] = item;
            });
          } else if (_.isObject(innerData) && _.has(innerData, 'id')) {
            this.streams[streamId].type = 'singleObject';
            dataIds[innerData.id] = true;
            this.resources[innerData.id] = innerData;
          }

          if (included) {
            _(included).forEach(item => this.resources[item.id] = item);
          }
        }

        // this.streams[streamId].data = data;
        this.streams[streamId].dataIds = dataIds;

        console.log(this.streams);
        console.log(this.resources);

        return data;
      })
      .filter((data) => data !== 'initial')
      .distinctUntilChanged()
      .publishReplay(1)
      .refCount();

      return this.streams[streamId];
    }

    return this.streams[existingStreamId];
  }

  update(dataId: string, object: any, refetch: boolean = false) {
    _.forOwn(this.streams, (stream, streamId) => {
      if (stream.observer !== null) {
        if (!refetch && stream.type === 'singleObject') {
          stream.observer.next(object);
        } else if (!refetch && stream.type === 'arrayOfObjects') {
          stream.observer.next((item) => ({
            ...item,
            data: item.data.map(child => child.id === dataId ? object.data : child)
          }));
        } else if (_.isFunction(stream.fetch)) {
          stream.fetch();
        }
      } else {
        console.log('observer is null');
      }
    });
  }

  delete(dataId: string, refetch: boolean = false) {
    _.forOwn(this.streams, (stream, streamId) => {
      if (stream.observer !== null) {
        if (!refetch && stream.type === 'singleObject') {
          stream.observer.next(undefined);
        } else if (!refetch && stream.type === 'arrayOfObjects') {
          stream.observer.next((item) => ({
            ...item,
            data: item.data.filter(child => child.id !== dataId)
          }));
        } else if (_.isFunction(stream.fetch)) {
          stream.fetch();
        }
      } else {
        console.log('observer is null');
      }
    });
  }
}

const streams = new Streams();
export default streams;
