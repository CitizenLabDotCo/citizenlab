import { Observable } from 'rxjs/Observable';
import 'whatwg-fetch';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';
import { store } from 'app';
import { authApiEndpoint } from 'services/auth';
import { mergeJsonApiResources } from 'utils/resources/actions';

export type pureFn<T> = (arg: T) => T;
type fetchFn<T> = () => Promise<{}>;
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
  streamId: string;
  isQueryStream: boolean;
  isSearchQuery: boolean;
  isSingleItemStream: boolean;
  type: 'singleObject' | 'arrayOfObjects' | 'unknown';
  fetch: fetchFn<T>;
  observer: IObserver<T>;
  observable: IObservable<T>;
  dataIds: { [key: string]: true };
}

class Streams {
  public streams: { [key: string]: IStream<any>};
  public resourcesByDataId: { [key: string]: any };
  public resourcesByStreamId: { [key: string]: any };
  public streamIdsByApiEndPointWithQuery: { [key: string]: string[] };
  public streamIdsByApiEndPointWithoutQuery: { [key: string]: string[] };
  public streamIdsByDataIdWithoutQuery: { [key: string]: string[] };
  public streamIdsByDataIdWithQuery: { [key: string]: string[] };

  constructor() {
    this.streams = {};
    this.resourcesByDataId = {};
    this.resourcesByStreamId = {};
    this.streamIdsByApiEndPointWithQuery = {};
    this.streamIdsByApiEndPointWithoutQuery = {};
    this.streamIdsByDataIdWithoutQuery = {};
    this.streamIdsByDataIdWithQuery = {};
  }

  reset() {
    this.resourcesByDataId = {};
    this.resourcesByStreamId = {};
    this.streamIdsByApiEndPointWithQuery = {};
    this.streamIdsByApiEndPointWithoutQuery = {};
    this.streamIdsByDataIdWithoutQuery = {};
    this.streamIdsByDataIdWithQuery = {};

    Object.keys(this.streams)
      .filter(streamId => streamId !== authApiEndpoint)
      .forEach((streamId) => {
        const apiEndpoint = this.streams[streamId].params.apiEndpoint;
        this.deleteStream(streamId, apiEndpoint);
      });
  }

  deleteStream(streamId: string, apiEndpoint: string) {
    if (_(this.streamIdsByApiEndPointWithQuery[apiEndpoint]).some(value => value === streamId)) {
      this.streamIdsByApiEndPointWithQuery[apiEndpoint] = this.streamIdsByApiEndPointWithQuery[apiEndpoint].filter((value) => {
        return value !== streamId;
      });            
    }

    if (_(this.streamIdsByApiEndPointWithoutQuery[apiEndpoint]).some(value => value === streamId)) {
      this.streamIdsByApiEndPointWithoutQuery[apiEndpoint] = this.streamIdsByApiEndPointWithoutQuery[apiEndpoint].filter((value) => {
        return value !== streamId;
      });            
    }

    Object.keys(this.streams[streamId].dataIds).forEach((dataId) => {
      if (_(this.streamIdsByDataIdWithQuery[dataId]).some(value => value === streamId)) {
        this.streamIdsByDataIdWithQuery[dataId] =  this.streamIdsByDataIdWithQuery[dataId].filter((value) => {
          return value !== streamId;
        });
      }

      if (_(this.streamIdsByDataIdWithoutQuery[dataId]).some(value => value === streamId)) {
        this.streamIdsByDataIdWithoutQuery[dataId] = this.streamIdsByDataIdWithoutQuery[dataId].filter((value) => {
          return value !== streamId;
        });
      }
    });

    delete this.streams[streamId];
  }

  isUUID(string) {
    const uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegExp.test(string);
  }

  isQuery(queryParameters: null | object) {
    return _.isObject(queryParameters) && !_.isEmpty(queryParameters);
  }

  removeTrailingSlash(apiEndpoint: string) {
    return apiEndpoint.replace(/\/$/, '');
  }

  getSerializedUrl(apiEndpoint: string, queryParameters: IObject | null) {
    if (this.isQuery(queryParameters) && queryParameters) {
      return apiEndpoint + Object.keys(queryParameters).sort().map((key) => {
        return encodeURIComponent(key) + '=' + encodeURIComponent((queryParameters)[key]);
      }).join('&');
    }

    return apiEndpoint;
  }

  addStreamIdByDataIdIndex(streamId: string, isQueryStream: boolean, isSearchQuery: boolean, dataId: string) {
    if (isQueryStream && !isSearchQuery) {
      if (this.streamIdsByDataIdWithQuery[dataId] && !_.some(this.streamIdsByDataIdWithQuery[dataId], streamId)) {
        this.streamIdsByDataIdWithQuery[dataId].push(streamId);
      } else if (!this.streamIdsByDataIdWithQuery[dataId]) {
        this.streamIdsByDataIdWithQuery[dataId] = [streamId];
      }
    }

    if (!isQueryStream) {
      if (this.streamIdsByDataIdWithoutQuery[dataId] && !_.some(this.streamIdsByDataIdWithoutQuery[dataId], streamId)) {
        this.streamIdsByDataIdWithoutQuery[dataId].push(streamId);
      } else if (!this.streamIdsByDataIdWithoutQuery[dataId]) {
        this.streamIdsByDataIdWithoutQuery[dataId] = [streamId];
      }
    }
  }

  addStreamIdByApiEndpointIndex(apiEndpoint: string, streamId: string, isQueryStream: boolean, isSearchQuery: boolean) {
    if (isQueryStream && !isSearchQuery) {
      if (!this.streamIdsByApiEndPointWithQuery[apiEndpoint]) {
        this.streamIdsByApiEndPointWithQuery[apiEndpoint] = [streamId];
      } else {
        this.streamIdsByApiEndPointWithQuery[apiEndpoint].push(streamId);
      }
    }

    if (!isQueryStream) {
      if (!this.streamIdsByApiEndPointWithoutQuery[apiEndpoint]) {
        this.streamIdsByApiEndPointWithoutQuery[apiEndpoint] = [streamId];
      } else {
        this.streamIdsByApiEndPointWithoutQuery[apiEndpoint].push(streamId);
      }
    }
  }

  get<T>(inputParams: IInputStreamParams<T>) {
    const params: IExtendedStreamParams<T> = { bodyData: null, queryParameters: null, ...inputParams };
    const apiEndpoint = this.removeTrailingSlash(params.apiEndpoint);
    const queryParameters = params.queryParameters;
    const streamId = this.getSerializedUrl(apiEndpoint, queryParameters);

    if (!_.has(this.streams, streamId)) {
      const { bodyData } = params;
      const lastUrlSegment = apiEndpoint.substr(apiEndpoint.lastIndexOf('/') + 1);
      const isQueryStream = this.isQuery(queryParameters);
      const isSearchQuery = (isQueryStream && _.has(queryParameters as any, 'search'));
      const isSingleItemStream = (!isQueryStream ? this.isUUID(lastUrlSegment) : false);
      const observer: IObserver<T | null> = (null as any);

      const fetch = () => {
        return new Promise((resolve, reject) => {
          const promise = request<any>(apiEndpoint, bodyData, { method: 'GET' }, queryParameters);

          Rx.Observable.defer(() => promise).retry(2).subscribe(
            (response) => {
              console.log(`fetched data for ${streamId}`);

              if (this.streams[streamId]) {
                this.streams[streamId].observer.next(response);
              } else {
                console.log(`no stream exists for ${streamId}`);
              }

              resolve(response);
            },
            (error) => {
              console.log(`promise for stream ${streamId} did not resolve`);

              if (this.streams[streamId]) {
                this.streams[streamId].observer.next(null);
              } else {
                console.log(`no stream exists for ${streamId}`);
              }

              reject();
            }
          );
        });
      };

      const observable = new Observable<T | null>((observer) => {
        const dataId = lastUrlSegment;
        this.streams[streamId].observer = observer;

        if (isSingleItemStream && _.has(this.resourcesByDataId, dataId)) {
          observer.next(this.resourcesByDataId[dataId]);
        } else if (_.has(this.resourcesByStreamId, streamId)) {
          observer.next(this.resourcesByStreamId[streamId]);
        } else {
          fetch();
        }

        return () => {
          console.log(`stream for stream ${streamId} completed`);
          this.deleteStream(streamId, apiEndpoint);
        };
      })
      .startWith('initial' as any)
      .scan((accumulated: T, current: T | pureFn<T>) => {
        let data: any = accumulated;
        const dataIds = {};

        this.streams[streamId].type = 'unknown';

        if (data !== 'inital') {
          data = (_.isFunction(current) ? current(data) : current);

          if (_.isObject(data) && !_.isEmpty(data)) {
            const innerData = data.data;

            if (_.isArray(innerData)) {
              this.streams[streamId].type = 'arrayOfObjects';
              innerData.filter(item => _.has(item, 'id')).forEach((item) => {
                const dataId = item.id;
                dataIds[dataId] = true;
                this.resourcesByDataId[dataId] = { data: item };
                this.addStreamIdByDataIdIndex(streamId, isQueryStream, isSearchQuery, dataId);
              });
            } else if (_.isObject(innerData) && _.has(innerData, 'id')) {
              const dataId = innerData.id;
              this.streams[streamId].type = 'singleObject';
              dataIds[dataId] = true;
              this.resourcesByDataId[dataId] = { data: innerData };
              this.addStreamIdByDataIdIndex(streamId, isQueryStream, isSearchQuery, dataId);
            }

            if (_.has(data, 'included')) {
              data.included.filter(item => item.id).forEach(item => this.resourcesByDataId[item.id] = { data: item });
              data = _.omit(data, 'included');
            }
          }

          if (!isSingleItemStream) {
            this.resourcesByStreamId[streamId] = data;
          }
        }

        this.streams[streamId].dataIds = dataIds;

        return data;
      })
      .filter(data => data !== 'initial')
      .distinctUntilChanged()
      .do(data => store.dispatch(mergeJsonApiResources(data)))
      .publishReplay(1)
      .refCount();

      this.streams[streamId] = {
        params,
        fetch,
        observer,
        observable,
        streamId,
        isQueryStream,
        isSearchQuery,
        isSingleItemStream,
        type: 'unknown',
        dataIds: {}
      };

      this.addStreamIdByApiEndpointIndex(apiEndpoint, streamId, isQueryStream, isSearchQuery);

      if (!isSearchQuery) {
        // keep stream hot
        this.streams[streamId].observable.subscribe();
      }

      return this.streams[streamId] as IStream<T>;
    }

    return this.streams[streamId] as IStream<T>;
  }

  async add<T>(unsafeApiEndpoint: string, bodyData: object | null) {
    const apiEndpoint = this.removeTrailingSlash(unsafeApiEndpoint);

    try {
      const response = await request<T>(apiEndpoint, bodyData, { method: 'POST' }, null);

      _(this.streamIdsByApiEndPointWithoutQuery[apiEndpoint]).forEach((streamId) => {
        this.streams[streamId].observer.next((previous) => ({
          ...previous,
          data: [...previous.data, response['data']]
        }));
      });

      _(this.streamIdsByApiEndPointWithQuery[apiEndpoint]).forEach((streamId) => {
        this.streams[streamId].fetch();
      });

      return response;
    } catch (error) {
      console.log(error);
      throw `error for add() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async update<T>(unsafeApiEndpoint: string, dataId: string, bodyData: object) {
    const apiEndpoint = this.removeTrailingSlash(unsafeApiEndpoint);

    try {
      const response = await request<T>(apiEndpoint, bodyData, { method: 'PATCH' }, null);

      _.union(
        this.streamIdsByDataIdWithoutQuery[dataId],
        this.streamIdsByDataIdWithQuery[dataId]
      ).forEach((streamId) => {
        const stream = this.streams[streamId];
        const streamHasDataId = _.has(stream, `dataIds.${dataId}`);

        if (streamHasDataId && stream.type === 'singleObject') {
          stream.observer.next(response);
        } else if (streamHasDataId && stream.type === 'arrayOfObjects') {
          stream.observer.next((previous) => ({
            ...previous,
            data: previous.data.map(child => child.id === dataId ? response['data'] : child)
          }));
        }
      });

      _.union(
        this.streamIdsByApiEndPointWithQuery[apiEndpoint], 
        this.streamIdsByDataIdWithQuery[dataId]
      ).forEach(streamId => this.streams[streamId].fetch());

      return response;
    } catch (error) {
      console.log(error);
      throw `error for update() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async delete(unsafeApiEndpoint: string, dataId: string) {
    const apiEndpoint = this.removeTrailingSlash(unsafeApiEndpoint);

    try {
      await request(apiEndpoint, null, { method: 'DELETE' }, null);

      _.union(
        this.streamIdsByDataIdWithoutQuery[dataId],
        this.streamIdsByDataIdWithQuery[dataId]
      ).forEach((streamId) => {
        const stream = this.streams[streamId];
        const streamHasDataId = _.has(stream, `dataIds.${dataId}`);

        if (streamHasDataId && stream.type === 'singleObject') {
          stream.observer.next(undefined);
        } else if (streamHasDataId && stream.type === 'arrayOfObjects') {
          stream.observer.next((previous) => ({
            ...previous,
            data: previous.data.filter(child => child.id !== dataId)
          }));
        }
      });

      _.union(
        this.streamIdsByApiEndPointWithQuery[apiEndpoint], 
        this.streamIdsByDataIdWithQuery[dataId]
      ).forEach(streamId => this.streams[streamId].fetch());

      return true;
    } catch (error) {
      console.log(error);
      throw `error for delete() of Streams for api endpoint ${apiEndpoint}`;
    }
  }
}

const streams = new Streams();
export default streams;
