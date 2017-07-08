import 'whatwg-fetch';
import Rx from 'rxjs/Rx';
import _ from 'lodash';
import request from 'utils/request';
import { v4 as uuid } from 'uuid';

class Streams {
  constructor() {
    this.listOfStreams = [];
  }

  create(apiEndpoint, queryParameters = null, localProperties = false) {
    const existingStream = this.listOfStreams.find((item) => {
      return (
        _.isEqual(item.apiEndpoint, apiEndpoint) &&
        _.isEqual(item.queryParameters, queryParameters) &&
        _.isEqual(item.localProperties, localProperties)
      );
    });

    if (!existingStream) {
      const newStream = {
        id: uuid(),
        apiEndpoint,
        queryParameters,
        localProperties,
        observer: null,
        observable: null,
        data: null,
      };

      newStream.observable = Rx.Observable.create((observer) => {
        newStream.observer = observer;

        request(apiEndpoint, null, null, queryParameters).then((response) => {
          observer.next(response.data);
        });

        return () => {
          this.listOfStreams = this.listOfStreams.filter((stream) => stream.id !== newStream.id);
        };
      })
      .startWith('initial')
      .scan((accumulated, current) => {
        let data = accumulated;

        if (!_.isFunction(current) && _.isObject(localProperties)) {
          if (_.isArray(current)) {
            data = current.map((child) => ({ ...child, ...localProperties }));
          } else if (_.isObject(current)) {
            data = { ...current, ...localProperties };
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

      this.listOfStreams = [...this.listOfStreams, newStream];

      return newStream;
    }

    return existingStream;
  }
}

export default new Streams();
