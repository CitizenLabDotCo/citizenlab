import { observeIdeas } from 'services/ideas';
import { Observable } from 'rxjs/Observable';
import { IStream } from './streams';
import 'whatwg-fetch';
import * as Rx from 'rxjs/Rx';
import * as _ from 'lodash';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';

type pureFn<T> = (arg: T) => T;
type fetchFn<T> = () => Observable<T>;
interface IObject{ [key: string]: any; }
export type Observer<T> = Rx.Observer<T | ((arg: T) => T) | Error>;
export type Observable<T> = Rx.Observable<T>;
export interface IStream<T> {
  id: string;
  apiEndpoint: string;
  headerData: IObject | null;
  httpMethod: IObject | null;
  queryParameters: IObject | null;
  localProperties: IObject | null;
  onEachEmit: pureFn<T> | null;
  fetch: fetchFn<T> | null;
  observer: Observer<T> | null;
  observable: Observable<T> | null;
  data: T | null;
}

class Streams {
  listOfStreams: IStream<any>[];

  constructor() {
    this.listOfStreams = [];
  }

  create<T>(
    apiEndpoint: string,
    headerData: IObject | null = null,
    httpMethod: IObject | null = null,
    queryParameters: IObject | null = null,
    localProperties: IObject | null = null,
    onEachEmit: pureFn<T> | null = null,
  ) {
    const existingStream = <IStream<T>>this.listOfStreams.find((stream) => {
      return (
        _.isEqual(stream.apiEndpoint, apiEndpoint) &&
        _.isEqual(stream.headerData, headerData) &&
        _.isEqual(stream.httpMethod, httpMethod) &&
        _.isEqual(stream.queryParameters, queryParameters) &&
        _.isEqual(stream.localProperties, localProperties) &&
        _.isEqual(stream.onEachEmit, onEachEmit)
      );
    });

    if (!existingStream) {
      const id = uuid();
      const newStream: IStream<T> = {
        id,
        apiEndpoint,
        headerData,
        httpMethod,
        queryParameters,
        localProperties,
        onEachEmit,
        fetch: null,
        observer: null,
        observable: null,
        data: null,
      };

      const observable: Observable<T> = Rx.Observable.create((observer: Observer<T>) => {
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
          this.listOfStreams = this.listOfStreams.filter((stream) => stream.id !== newStream.id);
        };
      })
      .startWith('initial')
      .scan((accumulated: T, current: T | pureFn<T>) => {
        let data = accumulated;

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
