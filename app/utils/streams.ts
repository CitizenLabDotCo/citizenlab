import 'whatwg-fetch';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import { API_PATH } from 'containers/App/constants';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';
import { store } from 'app';
import { mergeJsonApiResources } from 'utils/resources/actions';

export type pureFn<T> = (arg: T) => T;
type fetchFn<T> = () => IStream<T>;
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
  type: 'singleObject' | 'arrayOfObjects' | 'unknown';
  fetch: fetchFn<T>;
  observer: IObserver<T> | null;
  observable: IObservable<T>;
  dataIds: { [key: string]: true };
}

class Streams {
  public streams: { [key: string]: IStream<any>};
  private streamsIndex: { [key: string]: IStream<any>};
  private resources: { [key: string]: any };
  private apiEndpointResources: { [key: string]: any };

  constructor() {
    this.streams = {};
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

  findExistingStreamId(params: IExtendedStreamParams<any>) {
    let existingStreamId: string | null = null;

    _.forOwn(this.streams, (existingStream, streamId) => {
      if (params.apiEndpoint === existingStream.params.apiEndpoint) {
        const requestedStreamIsQuery = this.isQuery(params.queryParameters);
        const existingStreamIsQuery = this.isQuery(existingStream.params.queryParameters);

        if ((requestedStreamIsQuery && existingStreamIsQuery && _.isEqual(params.queryParameters, existingStream.params.queryParameters)) || (!requestedStreamIsQuery && !existingStreamIsQuery)) {
          existingStreamId = streamId;
          return false;
        }
      }

      return true;
    });

    return existingStreamId;
  }

  get<T>(inputParams: IInputStreamParams<T>) {
    const params: IExtendedStreamParams<T> = {
      bodyData: null,
      queryParameters: null,
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
        dataIds: {},
      };

      const { apiEndpoint, queryParameters } = this.streams[streamId].params;
      if (queryParameters) {
        const url = apiEndpoint + Object.keys(queryParameters).map((k) => {
            return encodeURIComponent(k) + '=' + encodeURIComponent(queryParameters[k]);
        }).join('&');

        console.log(url);
      }

      this.streams[streamId].fetch = () => {
        const { apiEndpoint, bodyData, queryParameters } = this.streams[streamId].params;
        const promise = request<any>(apiEndpoint, bodyData, { method: 'GET' }, queryParameters);

        Rx.Observable.defer(() => promise).retry(2).subscribe(
          (response) => {
            if (this.isQuery(queryParameters)) {
              console.log(`fetched data for ${apiEndpoint} with queryParams:`);
              console.log(queryParameters);
            } else {
              console.log(`fetched data for ${apiEndpoint}`);
            }

            (this.streams[streamId].observer as IObserver<any>).next(response);
          },
          (error) => {
            console.log(`promise for api endpoint ${apiEndpoint} did not resolve`);
            (this.streams[streamId].observer as IObserver<any>).next(null);
          }
        );

        return this.streams[streamId];
      };

      if (this.streams[streamId].observable === null) {
        this.streams[streamId].observable = Rx.Observable.create((observer: IObserver<T>) => {
          if (this.streams[streamId].observer === null) {
            const { apiEndpoint, queryParameters } = this.streams[streamId].params;
            const lastSegment = apiEndpoint.substr(apiEndpoint.lastIndexOf('/') + 1);

            this.streams[streamId].observer = observer;

            if (_.has(this.resources, lastSegment)) {
              observer.next(this.resources[lastSegment]);
            } else if (!this.isQuery(queryParameters) && _.has(this.apiEndpointResources, apiEndpoint)) {
              observer.next(this.apiEndpointResources[apiEndpoint]);
            } else {
              this.streams[streamId].fetch();
            }
          }
        })
        .startWith('initial')
        .scan((accumulated: T, current: T | pureFn<T>) => {
          let data: any = accumulated;
          const dataIds = {};
          const { apiEndpoint, queryParameters } = this.streams[streamId].params;

          data = (_.isFunction(current) ? current(data) : current);

          // add to redux resources store
          store.dispatch(mergeJsonApiResources(data));

          if (_.isObject(data) && !_.isEmpty(data)) {
            const innerData = data.data;
            const included = (data.included ? data.included : null);

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

            if (included) {
              included.filter(item => item.id).forEach(item => this.resources[item.id] = { data: item });
              data = _.omit(data, 'included');
            }
          }

          if (!this.isQuery(queryParameters)) {
            const lastSegment = apiEndpoint.substr(apiEndpoint.lastIndexOf('/') + 1);

            if (!this.isUUID(lastSegment) && lastSegment !== 'current') {
              this.apiEndpointResources[apiEndpoint] = data;
            }
          }

          this.streams[streamId].dataIds = dataIds;

          return data;
        })
        .filter((data) => data !== 'initial')
        .distinctUntilChanged()
        .publishReplay(1)
        .refCount();
      }

      return <IStream<T>>this.streams[streamId];
    }

    return <IStream<T>>this.streams[existingStreamId];
  }

  async add<T>(apiEndpoint: string, bodyData: object | null) {
    try {
      const addedObject = await request<T>(apiEndpoint, bodyData, { method: 'POST' }, null);

      _.forOwn(this.streams, (stream, streamId) => {
        if (stream.params.apiEndpoint === apiEndpoint) {
          if (this.isQuery(stream.params.queryParameters)) {
            stream.fetch();
          } else if (stream.observer) {
            stream.observer.next((emittedValue) => ({
              ...emittedValue,
              data: emittedValue.data.push(addedObject)
            }));
          }
        }
      });

      return addedObject;
    } catch (error) {
      console.log(error);
      throw `error for add() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async update<T>(apiEndpoint: string, dataId: string, bodyData: object) {
    try {
      const updatedObject = await request<T>(apiEndpoint, bodyData, { method: 'PATCH' }, null);

      _.forOwn(this.streams, (stream, streamId) => {
        if ((stream.params.apiEndpoint === apiEndpoint && this.isQuery(stream.params.queryParameters)) || (stream.dataIds[dataId] && stream.type === 'unknown')) {
          stream.fetch();
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'singleObject') {
          stream.observer.next(updatedObject);
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'arrayOfObjects') {
          stream.observer.next((emittedValue) => ({
            ...emittedValue,
            data: emittedValue.data.map(child => child.id === dataId ? (updatedObject as any).data : child)
          }));
        }
      });

      return updatedObject;
    } catch (error) {
      console.log(error);
      throw `error for update() of Streams for api endpoint ${apiEndpoint}`;
    }
  }

  async delete(apiEndpoint: string, dataId: string) {
    try {
      await request(apiEndpoint, null, { method: 'DELETE' }, null);

      _.forOwn(this.streams, (stream, streamId) => {
        if ((stream.params.apiEndpoint === apiEndpoint && this.isQuery(stream.params.queryParameters)) || (stream.dataIds[dataId] && stream.type === 'unknown')) {
          stream.fetch();
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'singleObject') {
          stream.observer.next(undefined);
        } else if (stream.dataIds[dataId] && stream.observer && stream.type === 'arrayOfObjects') {
          stream.observer.next((emittedValue) => ({
            ...emittedValue,
            data: emittedValue.data.filter(child => child.id !== dataId)
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
