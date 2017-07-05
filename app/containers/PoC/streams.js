import Rx from 'rxjs/Rx';
import _ from 'lodash';
import request from 'utils/request';

class Streams {
  constructor() {
    this.objectStreams = {};
    this.arrayStreams = {};
  }

  arrayStream(url, onChildAdded = false, queryKey = false) {
    const urlString = (!queryKey ? url : `${url}/querykey=${queryKey}`);

    if (!this.arrayStreams[urlString]) {
      this.arrayStreams[urlString] = {};

      this.arrayStreams[urlString].observable = Rx.Observable.create((internalObserver) => {
        this.arrayStreams[urlString].observer = internalObserver;

        request(url, null, null, null).then((response) => {
          internalObserver.next(response.data);
        }).catch((error) => {
          console.log(error);
        });

        return () => {
          delete this.arrayStreams[urlString];
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

        this.arrayStreams[urlString].data = data;

        return data;
      })
      .distinctUntilChanged()
      .publishReplay(1)
      .refCount();
    }

    return this.arrayStreams[urlString];
  }
}

export default new Streams();
