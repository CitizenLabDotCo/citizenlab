import { Observable } from 'rxjs/Observable';
import { observeIdeas } from 'services/ideas';
import 'whatwg-fetch';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';

type pureFn<T> = (arg: T) => T;
type fetchFn<T> = () => IObservable<T>;
interface IObject{ [key: string]: any; }
export type IObserver<T> = Rx.Observer<T | ((arg: T) => T) | Error>;
export type IObservable<T> = Rx.Observable<T>;
export interface IStreamParams<T> {
  headerData?: IObject;
  httpMethod?: IObject;
  queryParameters?: IObject;
  localProperties?: IObject;
  onEachEmit?: pureFn<T>;
  streamName?: string;
}
interface IInputStreamParams<T> extends IStreamParams<T> {
  apiEndpoint: string;
}
interface IExtendedStreamParams<T> {
  apiEndpoint: string;
  headerData: IObject | null;
  httpMethod: IObject | null;
  queryParameters: IObject | null;
  localProperties: IObject | null;
  onEachEmit: pureFn<T> | null;
  streamName: string | null;
}
export interface IStream<T> {
  streamId: string;
  apiEndpoint: string;
  headerData: IObject | null;
  httpMethod: IObject | null;
  queryParameters: IObject | null;
  localProperties: IObject | null;
  onEachEmit: pureFn<T> | null;
  streamName: string | null;
  fetch: fetchFn<T> | null;
  observer: IObserver<T> | null;
  observable: IObservable<T>;
  data: T | null;
}

class Streams {
  listOfStreams: IStream<any>[];

  constructor() {
    this.listOfStreams = [];
  }

  create<T>(inputParams: IInputStreamParams<T>) {
    const params: IExtendedStreamParams<T> = {
      headerData: null,
      httpMethod: null,
      queryParameters: null,
      localProperties: null,
      onEachEmit: null,
      streamName: null,
      ...inputParams
    };
    const existingStream = <IStream<T>>this.listOfStreams.find((stream) => {
      return (
        _.isEqual(stream.apiEndpoint, params.apiEndpoint) &&
        _.isEqual(stream.headerData, params.headerData) &&
        _.isEqual(stream.httpMethod, params.httpMethod) &&
        _.isEqual(stream.queryParameters, params.queryParameters) &&
        _.isEqual(stream.localProperties, params.localProperties) &&
        _.isEqual(stream.onEachEmit, params.onEachEmit) &&
        _.isEqual(stream.streamName, params.streamName)
      );
    });

    if (!existingStream) {
      const newStream: IStream<T> = {
        streamId: uuid(),
        streamName: params.streamName,
        apiEndpoint: params.apiEndpoint,
        headerData: params.headerData,
        httpMethod: params.httpMethod,
        queryParameters: params.queryParameters,
        localProperties: params.localProperties,
        onEachEmit: params.onEachEmit,
        fetch: null,
        observer: null,
        observable: <any>null,
        data: null,
      };

      const observable: IObservable<T> = Rx.Observable.create((observer: IObserver<T>) => {
        const { apiEndpoint, headerData, httpMethod, queryParameters } = newStream;

        newStream.observer = observer;

        newStream.fetch = () => {
          request(apiEndpoint, headerData, httpMethod, queryParameters).then((response) => {
            observer.next(response);
          }).catch(() => {
            observer.next(new Error(`promise for api endpoint ${apiEndpoint} did not resolve`));
          });

          return observable;
        };

        newStream.fetch();

        return () => {
          console.log(`stream for api endpoint ${apiEndpoint} completed`);
          this.listOfStreams = this.listOfStreams.filter((stream) => stream.streamId !== newStream.streamId);
        };
      })
      .startWith('initial')
      .scan((accumulated: T, current: T | pureFn<T>) => {
        let data = accumulated;
        const { onEachEmit, localProperties } = newStream;

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

        newStream.data = data;

        return data;
      })
      .filter((data) => data !== 'initial')
      .distinctUntilChanged()
      .publishReplay(1)
      .refCount();

      newStream.observable = observable;

      this.listOfStreams = [...this.listOfStreams, newStream];

      return newStream;
    }

    return existingStream;
  }
}

const streams = new Streams();
export default streams;
