import 'whatwg-fetch';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';
import { store } from 'app';
import { mergeJsonApiResources } from 'utils/resources/actions';

export type pureFn<T> = (arg: T) => T;
type fetchFn<T> = () => void;
interface IObject{ [key: string]: any; }
export type IObserver<T> = Rx.Observer<T | pureFn<T> | null>;
export type IObservable<T> = Rx.Observable<T>;
export interface IStreamParams<T> {
  bodyData?: IObject | null;
  queryParameters?: IObject | null;
}
interface IInputStreamParams<T> extends IStreamParams<T> {
  apiEndpoint: string;
}
interface IExtendedStreamParams<T> {
  apiEndpoint: string;
  bodyData: IObject | null;
  queryParameters: IObject | null;
}
export interface IStream<T> {
  params: IExtendedStreamParams<T>;
  serializedUrl: string;
  isQuery: boolean;
  isSingleItem: boolean;
  type: 'singleObject' | 'arrayOfObjects' | 'unknown';
  fetch: fetchFn<T>;
  observer: IObserver<T>;
  observable: IObservable<T>;
  dataIds: { [key: string]: true };
}

class Streams {
  public streams: { [key: string]: IStream<any>};
  private itemStore: { [key: string]: any };
  private serializedUrlStore: { [key: string]: any };

  constructor() {
    this.streams = {};
    this.itemStore = {};
    this.serializedUrlStore = {};
  }

  isUUID(string) {
    const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegExp.test(string);
  }

  isQuery(queryParameters: null | object) {
    return _.isObject(queryParameters) && !_.isEmpty(queryParameters);
  }

  getSerializedUrl(params: IExtendedStreamParams<any>) {
    const { apiEndpoint, queryParameters } = params;

    if (this.isQuery(queryParameters)) {
      return apiEndpoint + Object.keys(queryParameters as object).sort().map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent((queryParameters as object)[key]);
      }).join('&');
    }

    return apiEndpoint;
  }

  get<T>(inputParams: IInputStreamParams<T>) {
    const params: IExtendedStreamParams<T> = { bodyData: null, queryParameters: null, ...inputParams };
    const serializedUrl = this.getSerializedUrl(params);

    if (!_.has(this.streams, serializedUrl)) {
      const { apiEndpoint, bodyData, queryParameters } = params;
      const itemId = apiEndpoint.substr(apiEndpoint.lastIndexOf('/') + 1);
      const isQuery = this.isQuery(queryParameters);
      const isSingleItem = (!isQuery ? this.isUUID(itemId) : false);
      const observer: IObserver<T | null> = (null as any);

      const fetch = () => {
        const promise = request<any>(apiEndpoint, bodyData, { method: 'GET' }, queryParameters);

        Rx.Observable.defer(() => promise).retry(2).subscribe(
          (response) => {
            console.log(`fetched data for ${serializedUrl}`);
            if (this.streams[serializedUrl]) {
              this.streams[serializedUrl].observer.next(response);
            } else {
              console.log(`no stream exists for ${serializedUrl}`);
            }
          },
          (error) => {
            console.log(`promise for stream ${serializedUrl} did not resolve`);
            if (this.streams[serializedUrl]) {
              this.streams[serializedUrl].observer.next(null);
            }
          }
        );
      };

      const observable = (Rx.Observable.create((observer: IObserver<T | null>) => {
        this.streams[serializedUrl].observer = observer;

        if (isSingleItem && _.has(this.itemStore, itemId)) {
          observer.next(this.itemStore[itemId]);
        } else if (_.has(this.serializedUrlStore, serializedUrl)) {
          observer.next(this.serializedUrlStore[serializedUrl]);
        } else {
          fetch();
        }

        return () => {
          console.log(`stream for stream ${serializedUrl} completed`);
          delete this.streams[serializedUrl];
        };
      }) as Rx.Observable<T | null>)
      .startWith('initial' as any)
      .scan((accumulated: T, current: T | pureFn<T>) => {
        let data: any = accumulated;
        const dataIds = {};

        this.streams[serializedUrl].type = 'unknown';

        if (data !== 'inital') {
          data = (_.isFunction(current) ? current(data) : current);

          if (_.isObject(data) && !_.isEmpty(data)) {
            const innerData = data.data;

            if (_.isArray(innerData)) {
              this.streams[serializedUrl].type = 'arrayOfObjects';
              innerData.filter(item => _.has(item, 'id')).forEach((item) => {
                dataIds[item.id] = true;
                this.itemStore[item.id] = { data: item };
              });
            } else if (_.isObject(innerData) && _.has(innerData, 'id')) {
              this.streams[serializedUrl].type = 'singleObject';
              dataIds[innerData.id] = true;
              this.itemStore[innerData.id] = { data: innerData };
            }

            if (_.has(data, 'included')) {
              data.included.filter(item => item.id).forEach(item => this.itemStore[item.id] = { data: item });
              data = _.omit(data, 'included');
            }
          }

          if (!isSingleItem) {
            this.serializedUrlStore[serializedUrl] = data;
          }
        }

        this.streams[serializedUrl].dataIds = dataIds;

        return data;
      })
      .filter(data => data !== 'initial')
      .distinctUntilChanged()
      .do(data => store.dispatch(mergeJsonApiResources(data)))
      .publishReplay(1)
      .refCount();

      this.streams[serializedUrl] = {
        params,
        fetch,
        observer,
        observable,
        serializedUrl,
        isQuery,
        isSingleItem,
        type: 'unknown',
        dataIds: {},
      };

      this.streams[serializedUrl].observable.subscribe();

      return this.streams[serializedUrl] as IStream<T>;
    }

    return this.streams[serializedUrl] as IStream<T>;
  }

  async add<T>(apiEndpoint: string, bodyData: object | null) {
    try {
      const response = await request<T>(apiEndpoint, bodyData, { method: 'POST' }, null);

      _.forOwn(this.streams, (stream, streamId) => {
        if (stream.params.apiEndpoint === apiEndpoint) {
          if (stream.isQuery) {
            stream.fetch();
          } else {
            stream.observer.next((previous) => ({
              ...previous,
              data: [...previous.data, response['data']]
            }));
          }
        }
      });

      return response;
    } catch (error) {
      console.log(error);
      throw `error for add() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async update<T>(apiEndpoint: string, dataId: string, bodyData: object) {
    try {
      const response = await request<T>(apiEndpoint, bodyData, { method: 'PATCH' }, null);

      _.forOwn(this.streams, (stream, streamId) => {
        const streamHasDataId = _.has(stream, `dataIds.${dataId}`);

        if ((stream.params.apiEndpoint === apiEndpoint && stream.isQuery) || (streamHasDataId && stream.type === 'unknown')) {
          stream.fetch();
        } else if (streamHasDataId && stream.type === 'singleObject') {
          stream.observer.next(response);
        } else if (streamHasDataId && stream.type === 'arrayOfObjects') {
          stream.observer.next((previous) => ({
            ...previous,
            data: previous.data.map(child => child.id === dataId ? response['data'] : child)
          }));
        }
      });

      return response;
    } catch (error) {
      console.log(error);
      throw `error for update() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async delete(apiEndpoint: string, dataId: string) {
    try {
      await request(apiEndpoint, null, { method: 'DELETE' }, null);

      _.forOwn(this.streams, (stream, streamId) => {
        const streamHasDataId = _.has(stream, `dataIds.${dataId}`);

        if ((stream.params.apiEndpoint === apiEndpoint && stream.isQuery) || (streamHasDataId && stream.type === 'unknown')) {
          stream.fetch();
        } else if (streamHasDataId && stream.type === 'singleObject') {
          stream.observer.next(undefined);
        } else if (streamHasDataId && stream.type === 'arrayOfObjects') {
          stream.observer.next((previous) => ({
            ...previous,
            data: previous.data.filter(child => child.id !== dataId)
          }));
        }
      });

      return true;
    } catch (error) {
      console.log(error);
      throw `error for delete() of Streams for api endpoint ${apiEndpoint}`;
    }
  }
}

const streams = new Streams();
export default streams;
