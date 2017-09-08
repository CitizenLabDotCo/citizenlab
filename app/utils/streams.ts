import { IStream } from './streams';
import { Observable } from 'rxjs/Observable';
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
  id: string;
  params: IExtendedStreamParams<T>;
  serializedUrl: string;
  isQuery: boolean;
  type: 'singleObject' | 'arrayOfObjects' | 'unknown';
  fetch: fetchFn<T>;
  observer: IObserver<T>;
  observable: IObservable<T>;
  dataIds: { [key: string]: true };
}

class Streams {
  public streams: { [key: string]: IStream<any>};
  private streamsIndex: { [key: string]: string };
  private resources: { [key: string]: any };
  private apiEndpointResources: { [key: string]: any };

  constructor() {
    this.streams = {};
    this.streamsIndex = {};
    this.resources = {};
    this.apiEndpointResources = {};
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

  findExistingStreamId(serializedUrl: string) {
    if (this.streamsIndex[serializedUrl]) {
      return this.streamsIndex[serializedUrl];
    }

    return null;
  }

  get<T>(inputParams: IInputStreamParams<T>) {
    const params: IExtendedStreamParams<T> = { bodyData: null, queryParameters: null, ...inputParams };
    const serializedUrl = this.getSerializedUrl(params);
    const existingStreamId = this.findExistingStreamId(serializedUrl);

    // console.log(_.size(this.streams));

    if (!existingStreamId) {
      const { apiEndpoint, bodyData, queryParameters } = params;
      const streamId = uuid();
      const lastUrlSegment = apiEndpoint.substr(apiEndpoint.lastIndexOf('/') + 1);
      const isQuery = this.isQuery(queryParameters);
      const lastUrlSegmentIsId = this.isUUID(lastUrlSegment);
      const observer: IObserver<T | null> = (null as any);

      const fetch = () => {
        const promise = request<any>(apiEndpoint, bodyData, { method: 'GET' }, queryParameters);

        const updateOtherStreams = (updatedValue: any, dataId: string) => {
          _.forOwn(this.streams, (stream, streamId) => {
            if (stream.serializedUrl !== serializedUrl) {
              if (stream.dataIds[dataId] && stream.type === 'singleObject') {
                stream.observer.next({ data: updatedValue });
              } else if (stream.dataIds[dataId] && stream.type === 'arrayOfObjects') {
                stream.observer.next((previous) => ({
                  ...previous,
                  data: previous.data.map(child => child.id === dataId ? updatedValue : child)
                }));
              }
            }
          });
        };

        Rx.Observable.defer(() => promise).retry(2).subscribe(
          (response) => {
            console.log(`response for ${apiEndpoint}: `);
            console.log(response);

            if (isQuery) {
              console.log(`fetched data for ${apiEndpoint} with queryParams:`);
              console.log(queryParameters);
            } else {
              console.log(`fetched data for ${apiEndpoint}`);
            }

            this.streams[streamId].observer.next(response);

            if (response.data && _.isArray(response.data)) {
              response.data.filter(item => item.id).forEach((item) => {
                updateOtherStreams(item, item.id);
              });
            } else if (_.has(response, 'data.id')) {
              updateOtherStreams(response.data, response.data.id);
            }
          },
          (error) => {
            console.log(`promise for api endpoint ${apiEndpoint} did not resolve`);
            this.streams[streamId].observer.next(null);
          }
        );
      };

      const observable = (Rx.Observable.create((observer: IObserver<T | null>) => {
        if (!existingStreamId) {
          this.streams[streamId].observer = observer;

          // push initial data into stream
          if (_.has(this.resources, lastUrlSegment)) {
            observer.next(this.resources[lastUrlSegment]);
          } else if (!isQuery && _.has(this.apiEndpointResources, apiEndpoint)) {
            observer.next(this.apiEndpointResources[apiEndpoint]);
          } else {
            fetch();
          }
        }

        return () => {
          console.log(`stream for api endpoint ${apiEndpoint} completed`);
          delete this.streams[streamId];
          delete this.streamsIndex[serializedUrl];
        };
      }) as Observable<T | null>)
      .startWith('initial' as any)
      .scan((accumulated: T, current: T | pureFn<T>) => {
        let data: any = accumulated;
        const dataIds = {};

        data = (_.isFunction(current) ? current(data) : current);

        if (_.isObject(data) && !_.isEmpty(data)) {
          const innerData = data.data;

          if (_.isArray(innerData)) {
            this.streams[streamId].type = 'arrayOfObjects';
            innerData.filter(item => item.id).forEach((item) => {
              dataIds[item.id] = true;
              this.resources[item.id] = { data: item };
            });
          } else if (_.isObject(innerData) && _.has(innerData, 'id')) {
            this.streams[streamId].type = 'singleObject';
            dataIds[innerData.id] = true;
            this.resources[innerData.id] = data;
          }

          if (data.included) {
            data.included.filter(item => item.id).forEach(item => this.resources[item.id] = { data: item });
            data = _.omit(data, 'included');
          }
        }

        if (!isQuery && !lastUrlSegmentIsId) {
          this.apiEndpointResources[apiEndpoint] = data;
        }

        this.streams[streamId].dataIds = dataIds;

        return data;
      })
      .filter(data => data !== 'initial')
      .distinctUntilChanged()
      .do(data => store.dispatch(mergeJsonApiResources(data)))
      .publishReplay(1)
      .refCount();

      this.streamsIndex[serializedUrl] = streamId;

      this.streams[streamId] = {
        params,
        fetch,
        observer,
        observable,
        serializedUrl,
        isQuery,
        id: streamId,
        type: 'unknown',
        dataIds: {},
      };

      this.streams[streamId].observable.subscribe();

      return this.streams[streamId] as IStream<T>;
    }

    return this.streams[existingStreamId] as IStream<T>;
  }

  async add<T>(apiEndpoint: string, bodyData: object | null) {
    try {
      const response = await request<T>(apiEndpoint, bodyData, { method: 'POST' }, null);

      if (response === null) {
        console.log('warning: value for add() of Streams is null');
      } else {
        _.forOwn(this.streams, (stream, streamId) => {
          if (stream.params.apiEndpoint === apiEndpoint) {
            if (this.isQuery(stream.params.queryParameters)) {
              stream.fetch();
            } else {
              stream.observer.next((previous) => ({
                ...previous,
                data: [...previous.data, response['data']]
              }));
            }
          }
        });
      }

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
        if ((stream.params.apiEndpoint === apiEndpoint && stream.isQuery) || (stream.dataIds[dataId] && stream.type === 'unknown')) {
          stream.fetch();
        } else if (stream.dataIds[dataId] && stream.type === 'singleObject') {
          stream.observer.next(response);
        } else if (stream.dataIds[dataId] && stream.type === 'arrayOfObjects') {
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
        if ((stream.params.apiEndpoint === apiEndpoint && stream.isQuery) || (stream.dataIds[dataId] && stream.type === 'unknown')) {
          stream.fetch();
        } else if (stream.dataIds[dataId] && stream.type === 'singleObject') {
          stream.observer.next(undefined);
        } else if (stream.dataIds[dataId] && stream.type === 'arrayOfObjects') {
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
