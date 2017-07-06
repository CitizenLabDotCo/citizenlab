import 'whatwg-fetch';
import * as withQuery from 'with-query';
import Rx from 'rxjs/Rx';
import _ from 'lodash';
import request from 'utils/request';

class Streams {
  constructor() {
    this.arrayStreams = {};
  }

  arrayStream(url, onChildAdded = false, queryParameters = false) {
    const urlWithParams = (queryParameters ? withQuery(url, queryParameters) : url);

    if (!this.arrayStreams[urlWithParams]) {
      this.arrayStreams[urlWithParams] = {};

      this.arrayStreams[urlWithParams].observable = Rx.Observable.create((internalObserver) => {
        this.arrayStreams[urlWithParams].observer = internalObserver;

        request(url, null, null, null).then((response) => {
          internalObserver.next(response.data);
        }).catch((error) => {
          console.log(error);
        });

        return () => {
          delete this.arrayStreams[urlWithParams];
        };
      })
      .startWith(null)
      .scan((accumulated, current) => {
        let data = accumulated;

        if (!_.isFunction(current) && _.isFunction(onChildAdded)) {
          data = _(current).map((child) => onChildAdded(data, child)).value();
        } else if (_.isFunction(current)) {
          data = current(data);
        } else {
          data = current;
        }

        this.arrayStreams[urlWithParams].data = data;

        return data;
      })
      .distinctUntilChanged()
      .publishReplay(1)
      .refCount();
    }

    return this.arrayStreams[urlWithParams];
  }
}

export default new Streams();
