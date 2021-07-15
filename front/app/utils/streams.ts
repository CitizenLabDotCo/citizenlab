import { Observer, Observable, Subscription } from 'rxjs';
import {
  startWith,
  scan,
  filter,
  distinctUntilChanged,
  refCount,
  publishReplay,
} from 'rxjs/operators';
import {
  includes,
  flatten,
  forOwn,
  isArray,
  isString,
  isObject,
  isEmpty,
  isFunction,
  cloneDeep,
  has,
  omit,
  forEach,
  union,
  uniq,
  isUndefined,
} from 'lodash-es';
import request from 'utils/request';
import { authApiEndpoint } from 'services/auth';
import { currentAppConfigurationEndpoint } from 'services/appConfiguration';
import { currentOnboardingCampaignsApiEndpoint } from 'services/onboardingCampaigns';
import stringify from 'json-stable-stringify';
import { reportError } from 'utils/loggingUtils';
import { isUUID } from 'utils/helperUtils';
import modules from 'modules';

export type pureFn<T> = (arg: T) => T;
type fetchFn = () => Promise<any>;
interface IObject {
  [key: string]: any;
}
export type IObserver<T> = Observer<T | pureFn<T> | null>;
export interface IStreamParams {
  bodyData?: IObject | null;
  queryParameters?: IObject | null;
  cacheStream?: boolean;
  skipSanitizationFor?: string[];
}
export interface IInputStreamParams extends IStreamParams {
  apiEndpoint: string;
}
interface IExtendedStreamParams {
  apiEndpoint: string;
  cacheStream?: boolean;
  bodyData: IObject | null;
  queryParameters: IObject | null;
}
export interface IStream<T> {
  params: IExtendedStreamParams;
  streamId: string;
  isQueryStream: boolean;
  isSearchQuery: boolean;
  isSingleItemStream: boolean;
  cacheStream?: boolean;
  type: 'singleObject' | 'arrayOfObjects' | 'unknown';
  fetch: fetchFn;
  observer: IObserver<T>;
  observable: Observable<T>;
  subscription?: Subscription;
  dataIds: { [key: string]: true };
}

class Streams {
  public streams: { [key: string]: IStream<any> };
  public resourcesByDataId: { [key: string]: any };
  public streamIdsByApiEndPointWithQuery: { [key: string]: string[] };
  public streamIdsByApiEndPointWithoutQuery: { [key: string]: string[] };
  public streamIdsByDataIdWithoutQuery: { [key: string]: string[] };
  public streamIdsByDataIdWithQuery: { [key: string]: string[] };

  constructor() {
    // this.streams = collection of all streams that are initiated by endpoint
    // requests to the back-end
    this.streams = {};
    // this.resourcesByDataId = key-value object with keys being the unique data
    // id's (e.g. idea.data.id) and values the data associated with those id's
    this.resourcesByDataId = {};
    // this.streamIdsByApiEndPointWithQuery = key-value object that indexes all
    // streams with query params by their api endpoint. key = api endpoint,
    // value = the stream associated with this endpoint (included in this.streams)
    this.streamIdsByApiEndPointWithQuery = {};
    // this.streamIdsByApiEndPointWithoutQuery = same as
    // streamIdsByApiEndPointWithQuery, but instead indexes streams that do not
    // include query parameters
    this.streamIdsByApiEndPointWithoutQuery = {};
    // this.streamIdsByDataIdWithQuery = key-value object that indexes all streams
    // with query params by their dataId(s). key = api endpoint, value = the stream
    // associated with this endpoint (included in this.streams)
    this.streamIdsByDataIdWithoutQuery = {};
    // this.streamIdsByDataIdWithoutQuery = same as streamIdsByDataIdWithQuery,
    // but instead indexes streams that do not include query parameters
    this.streamIdsByDataIdWithQuery = {};
  }

  async reset() {
    this.resourcesByDataId = {};

    const promises: Promise<any>[] = [];
    const promisesToAwait: Promise<any>[] = [];

    // rootStreams are the streams that should always be refetched when a reset occurs,
    // and for which their refetch should be awaited before any others streams are refetched.
    // Currently the only 2 rootstreams are those for the authUser
    // and appConfiguration endpoints
    const rootStreamIds = [authApiEndpoint, currentAppConfigurationEndpoint];

    rootStreamIds.forEach((rootStreamId) => {
      promisesToAwait.push(this.streams[rootStreamId].fetch());
    });

    // Here we loop through all streams that are currently in the browser memory.
    // Every stream in the browser memory will be either refetched or removed
    // when reset() is executed, with the exception of the rootstreams
    // (authUser and appConfiguration) and the custom fields stream
    // ('/users/custom_fields/schema'), which we ignore here.
    Object.keys(this.streams).forEach((streamId) => {
      // If it's a rootstream or the custom fields stream
      // ('/users/custom_fields/schema') we ignore it.
      // The rootstreams are already included in promisesToAwait and therefore
      // so already queued for refetch, so would be redundant to add them to
      // the list of refetched streams here as well.
      // We also ignore the custom fields stream in order to fix a bug
      // that could potentially freeze the browser when the custom fields stream would be refetched.
      if (
        !includes(rootStreamIds, streamId) &&
        !streamId.endsWith('/users/custom_fields/schema')
      ) {
        // If the stream is currently active
        // (= being subscribed to by one or more components that are mounted when reset() gets called)
        // we inlcude the stream in the list of streams to refetch.
        // Otherwise we include the stream in the list of streams that will be removed,
        // with the exception of the custom fields stream
        if (
          this.isActiveStream(streamId) ||
          modules?.streamsToReset?.includes(streamId)
        ) {
          promises.push(this.streams[streamId].fetch());
        } else {
          this.deleteStream(
            streamId,
            this.streams[streamId].params.apiEndpoint
          );
        }
      }
    });

    try {
      // first we await the refetch promises for the rootstreams
      await Promise.all(promisesToAwait);
      // afterwards we refetch the active streams as determined
      // by the loop above -without- awaiting there promises as that would take up too much time and is not needed
      Promise.all(promises);
    } finally {
      // finally we return a true value. We use 'finally' here to not block the reset
      // from completing when there are refetches that fail
      return true;
    }
  }

  // Here we recursively freeze each property in the object provided
  // as the argument so that the return object is immutable (=read-only).
  // This is a safety mechanism we apply to all objects being put in
  // the streams to make sure that any given stream can
  // be simultaneously subscribed to in different components with the guarantee that
  // each component will receive the exact same data for that stream.
  // If the stream data would not be immutable, you could in theory
  // overwrite it in one place and (unknowingly) affect the data in other
  // places that subscribe to that stream as well.
  // By making the stream data immutable, you avoid this scenario.
  deepFreeze<T>(object: T): T {
    let frozenObject = object;

    if (frozenObject && !Object.isFrozen(frozenObject)) {
      let property;
      let propertyKey;

      frozenObject = Object.freeze(object);

      for (propertyKey in frozenObject) {
        if ((frozenObject as Object).hasOwnProperty(propertyKey)) {
          property = frozenObject[propertyKey];

          if (
            typeof property !== 'object' ||
            !(property instanceof Object) ||
            Object.isFrozen(property)
          ) {
            continue;
          }

          this.deepFreeze(property);
        }
      }
    }

    return frozenObject;
  }

  // Checks if a stream is subscribed to by one ore more currently mounted components.
  // To determine this, we use the internal rxjs refCount property, which keeps track
  // of the subscribe count for any given stream.
  isActiveStream(streamId: string) {
    const refCount = cloneDeep(
      this.streams[streamId].observable.source['_refCount']
    );
    const isCacheStream = cloneDeep(this.streams[streamId].cacheStream);

    // If a stream is cached we keep at least 1 subscription to it open at all times,
    // and therefore it will always have a refCount of at least 1.
    // Hence we have to check for a count larger than 1 to determine if the stream is
    // actively being used.
    // None-cached streams on the other hand are not subscribed to by default and
    // have a refCount of 0 when not actively used.
    if ((isCacheStream && refCount > 1) || (!isCacheStream && refCount > 0)) {
      return true;
    }

    return false;
  }

  // Completetly removes a stream from all indexes and from browser memory
  // We call this function in 2 places:
  // - Whenever a reset occurs (streams.reset())
  // -> here we destroy the streams so it can be re-initiated after a user has logged in or out
  // - When a fetch inside of streams.get() returns an error
  // -> here we destroy the stream so it can be re-initiated
  deleteStream(streamId: string, apiEndpoint: string) {
    if (includes(this.streamIdsByApiEndPointWithQuery[apiEndpoint], streamId)) {
      this.streamIdsByApiEndPointWithQuery[
        apiEndpoint
      ] = this.streamIdsByApiEndPointWithQuery[apiEndpoint].filter((value) => {
        return value !== streamId;
      });
    }

    if (
      includes(this.streamIdsByApiEndPointWithoutQuery[apiEndpoint], streamId)
    ) {
      this.streamIdsByApiEndPointWithoutQuery[
        apiEndpoint
      ] = this.streamIdsByApiEndPointWithoutQuery[apiEndpoint].filter(
        (value) => {
          return value !== streamId;
        }
      );
    }

    if (streamId && this.streams[streamId]) {
      Object.keys(this.streams[streamId].dataIds).forEach((dataId) => {
        if (includes(this.streamIdsByDataIdWithQuery[dataId], streamId)) {
          this.streamIdsByDataIdWithQuery[
            dataId
          ] = this.streamIdsByDataIdWithQuery[dataId].filter((value) => {
            return value !== streamId;
          });
        }

        if (includes(this.streamIdsByDataIdWithoutQuery[dataId], streamId)) {
          this.streamIdsByDataIdWithoutQuery[
            dataId
          ] = this.streamIdsByDataIdWithoutQuery[dataId].filter((value) => {
            return value !== streamId;
          });
        }
      });
    }

    if (this.streams[streamId] && this.streams[streamId].subscription) {
      (this.streams[streamId].subscription as Subscription).unsubscribe();
    }

    delete this.streams[streamId];
  }

  // Here we sanitize endpoints with query parameters
  // to normalize them (e.g. make sure any null, undefined or '' params
  // do not get taken into account when determining if a stream for the given params already exists).
  // The 'skipSanitizationFor' parameter can be used to provide
  // a list of query parameter names that should not be sanitized
  sanitizeQueryParameters = (
    queryParameters: IObject | null,
    skipSanitizationFor?: string[]
  ) => {
    const sanitizedQueryParameters = cloneDeep(queryParameters);

    forOwn(queryParameters, (value, key) => {
      if (
        !skipSanitizationFor?.includes(key) &&
        (isUndefined(value) ||
          (isString(value) && isEmpty(value)) ||
          (isArray(value) && isEmpty(value)) ||
          (isObject(value) && isEmpty(value)))
      ) {
        delete (sanitizedQueryParameters as IObject)[key];
      }
    });

    return isObject(sanitizedQueryParameters) &&
      !isEmpty(sanitizedQueryParameters)
      ? sanitizedQueryParameters
      : null;
  };

  // Determines wether the stream is associated with an endpoint
  // that return a single object (e.g. an idea endpoint)
  // or an endpoint that returns a collection of objects (e.g. the ideas endpoint)
  isSingleItemStream(lastUrlSegment: string, isQueryStream: boolean) {
    if (!isQueryStream) {
      // When the endpoint url ends with a UUID we're dealing with a single-item endpoint
      return isUUID(lastUrlSegment);
    }

    return false;
  }

  // Remove trailing slash to normalize the api endpoint names.
  // This is needed to avoid the creation of redundant streams for the same endpoint
  // (e.g. when providing the endpoint both with and without trailing slash)
  removeTrailingSlash(apiEndpoint: string) {
    return apiEndpoint.replace(/\/$/, '');
  }

  // The streamId is the unique identifier for a stream, and is composed by
  // the following data:
  // - The api endpoint
  // - An optional cache parameter set to false
  // when the stream is not cached (not included when cacheStream is true)
  // - Normalized and stringified query parameters (if any are present)
  // Together these parameters will return a streamId in the form of a string.
  getStreamId(
    apiEndpoint: string,
    isQueryStream: boolean,
    queryParameters: IObject | null,
    cacheStream: boolean
  ) {
    let streamId = apiEndpoint;

    if (!cacheStream) {
      streamId = `${streamId}?cached=${cacheStream}`;
    }

    if (queryParameters !== null && isQueryStream) {
      streamId = `${streamId}&${stringify(queryParameters)}`;
    }

    return streamId;
  }

  // addStreamIdByDataIdIndex will index a given streamId by the dataId(s) it includes.
  // This may sound a bit complicated, but it's actually rather simple:
  // Any given stream will have 1) a streamId and 2) one or more objects
  // with corresponding dataIds inside of it
  // E.g. You have a stream for the '/ideas' endpoint (without query
  // params to make it a bit simpler).
  // The streamId for this stream is '/ideas', and the stream includes
  // 2 idea objects. Each of these object has a data.id attribute
  // (= the unique identifier that's part of the object).
  // For the sake of the example: the first object has an dataId of
  // '123', the second object a dataId of '456'.
  // So we know that the stream with streamId '/ideas' has 2 objects
  // in it. We also know the stream does not contain any query parameters.
  // With this knowledge we can now index this stream by its dataIds,
  // e.g: this.streamIdsByDataIdWithoutQuery['123'] = ['/ideas']
  // and this.streamIdsByDataIdWithoutQuery['465'] = ['/ideas'].
  // Now that we have these indexes we can later determine which streams
  // to update when either the data with dataId '123' or '456' changes.
  // E.g. when an update to dataId '123' occurs we can loop through
  // all streams that contain this dataId, refetch their endpoints and push the new,
  // updated data in the corresponding streams.
  // Alternatively we can also manually push the updated objects into
  // all streams that contain this dataId.
  // Note: The latter case, manually pushing updated data into a stream,
  // only applies to none-query streams. The reason being that you don't want
  // to push data in a stream that contains a sorted or/and paginated list.
  // In this case manually adding/removing/updating an item in the list
  // might not reflect the new state the back-end would return.
  // For example: when the vote count on an idea changes, the newly
  // returned list of ideas might vary from the previous if it's sorted by votes.
  // The only way to have a correct reflection of this new state is to
  // refetch the list from the back-end. Hence never manually push data in a query stream,
  // but always do a refetch!
  addStreamIdByDataIdIndex(
    streamId: string,
    isQueryStream: boolean,
    dataId: string
  ) {
    if (isQueryStream) {
      if (
        this.streamIdsByDataIdWithQuery[dataId] &&
        !includes(this.streamIdsByDataIdWithQuery[dataId], streamId)
      ) {
        this.streamIdsByDataIdWithQuery[dataId].push(streamId);
      } else if (!this.streamIdsByDataIdWithQuery[dataId]) {
        this.streamIdsByDataIdWithQuery[dataId] = [streamId];
      }
    }

    if (!isQueryStream) {
      if (
        this.streamIdsByDataIdWithoutQuery[dataId] &&
        !includes(this.streamIdsByDataIdWithoutQuery[dataId], streamId)
      ) {
        this.streamIdsByDataIdWithoutQuery[dataId].push(streamId);
      } else if (!this.streamIdsByDataIdWithoutQuery[dataId]) {
        this.streamIdsByDataIdWithoutQuery[dataId] = [streamId];
      }
    }
  }

  // Same concept as addStreamIdByDataIdIndex, but instead of indexing by
  // dataId we index here by apiEndpoint
  // Why index by both dataId and apiEndpoint? Because we want to be able to
  // control refetches by both dataId and apiEndpoints.
  // Sometimes we might know the dataId of an object that is being updated/removed,
  // other times we only know the apiEndpoint -or- are creating a new object that does not have a dataId.
  // So to cover all cases you need to index the streams by both the dataIds
  // they include, and the apiEndpoint they represent.
  addStreamIdByApiEndpointIndex(
    apiEndpoint: string,
    streamId: string,
    isQueryStream: boolean
  ) {
    if (isQueryStream) {
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

  // This is the 'heart' of streams.ts.
  // Here we create a stream if it doesn't exist yet for the given set of criteria
  // (endpoint + query params + cacheStream) -or- return the previsouly created stream.
  get<T>(inputParams: IInputStreamParams) {
    const params: IExtendedStreamParams = {
      bodyData: null,
      queryParameters: null,
      ...inputParams,
    };
    const apiEndpoint = this.removeTrailingSlash(params.apiEndpoint);
    const queryParameters = this.sanitizeQueryParameters(
      params.queryParameters,
      inputParams.skipSanitizationFor
    );
    const isQueryStream =
      isObject(queryParameters) && !isEmpty(queryParameters);
    // Check if the requested endpoint contains a search query param. See explanation below for more details.
    const isSearchQuery =
      isQueryStream &&
      queryParameters &&
      queryParameters['search'] &&
      isString(queryParameters['search']) &&
      !isEmpty(queryParameters['search']);
    // whenever the cacheStream argument is set to false or a search param
    // is included in the list of query params
    // the stream will not be cached.
    // Why also for search queries? Because these could potentially create
    // many different streams (e.g. when the user performs multiple searches,
    // when the debouncing isn't fast enough, etc...)
    // and we don't want to cache them all as they might potentially take
    // up a lot amount of memory and even choke the system
    const cacheStream =
      isSearchQuery || inputParams.cacheStream === false ? false : true;
    const streamId = this.getStreamId(
      apiEndpoint,
      isQueryStream,
      queryParameters,
      cacheStream
    );

    // If a stream with the calculated streamId does not yet exist
    if (!has(this.streams, streamId)) {
      const { bodyData } = params;
      const lastUrlSegment = apiEndpoint.substr(
        apiEndpoint.lastIndexOf('/') + 1
      );
      // Use to last url segment of the requested endpoint and check if it's a UUID.
      // If so, we're dealing with a single-item endpoint (as opposed to an array)
      const isSingleItemStream = this.isSingleItemStream(
        lastUrlSegment,
        isQueryStream
      );
      // You can think of the observer as the 'pump' that takes data as input and pushes it,
      // using its .next() method, into the stream it's associated with.
      const observer: IObserver<T | null> = null as any;

      // Here we fetch the data for the given andpoint and push it into the associated stream
      const fetch = () => {
        return request<any>(
          apiEndpoint,
          bodyData,
          { method: 'GET' },
          queryParameters
        )
          .then((response) => {
            // grab the response and push it into the stream
            this.streams?.[streamId]?.observer?.next(response);
            return response;
          })
          .catch((error) => {
            // When the endpoint returns an error we destroy the stream
            // so it can again be recreated afterwards and start of with
            // a 'clean slate' to retry the endpoint.
            // Note: streams.ts will first push the error object into
            // the stream and only afterwards destroy it, so that any subscriber still gets the error object.
            // When an unsuscribe -> resubscribe action occurs in the hook
            // or component, streams.ts will create and fetch the stream from scratch again.
            // Note: when we're dealing with either the authUser stream or
            // the currentOnboardingCampaigns stream we do not destory the stream when an error occurs,
            // because these 2 endpoints produce error responses whenever
            // the user is not logged. There are however not 'true' errors
            // (e.g. not similar to, for example, a connection failure error)
            // but rather the back-end telling us the user needs to be logged in to use the endpoint.
            // We can therefore view errors from these 2 endpoints as valid return values
            // and exclude them from the error-handling logic.
            if (
              streamId !== authApiEndpoint &&
              streamId !== currentOnboardingCampaignsApiEndpoint
            ) {
              // push the error reponse into the stream
              this.streams[streamId].observer.next(error);
              // destroy the stream
              this.deleteStream(streamId, apiEndpoint);
              reportError(error);
              throw error;
            } else if (streamId === authApiEndpoint) {
              this.streams[streamId].observer.next(null);
            }

            return null;
          });
      };

      // The observable constant here can be considered as the pipe
      // that contains the stream (if that makes any sense :)).
      // E.g. when data gets pushed into the stream by using observer.next(),
      // you can think of it as the data being pushed into this observable pipe
      // to which you can subscribe to capture any data that comes out of this pipe.
      // To fully grasp the concepts invloved here I recommend to take
      // a deep dive into RxJS (trust me, you won't regret doing so!).
      const observable = new Observable<T | null>((observer) => {
        const dataId = lastUrlSegment;

        if (this.streams[streamId]) {
          this.streams[streamId].observer = observer;
        }

        // When we know the stream represents a single-item endpoint,
        // and cache for this stream is not turned of
        // we first check the resourcesByDataId key-value store to check
        // if it includes the object with the requested dataId.
        // If so, we directly push it into the stream without making a request to the server.
        // If not, we fetch the endpoint and push the return value into the stream (see fetch()).
        if (
          cacheStream &&
          isSingleItemStream &&
          has(this.resourcesByDataId, dataId)
        ) {
          observer.next(this.resourcesByDataId[dataId]);
        } else {
          fetch();
        }

        // clean-up function that gets triggered whenever there are no subscibers anymore to the stream
        // Note: cahced streams will always have at least 1 subscriber,
        // and therefore this function will only ever gets triggered for uncached streams
        return () => {
          this.deleteStream(streamId, apiEndpoint);
        };
      }).pipe(
        // startsWith -> will push an initial value into a newly created stream
        // as long as it's waiting for a proper respose. We check for this 'initial' string
        // to determine if the valid response already took place.
        // See https://www.learnrxjs.io/learn-rxjs/operators/combination/startwith for more info
        // scan
        // -> The RxJS documentation can probably explain it better than I can:
        // https://www.learnrxjs.io/learn-rxjs/operators/transformation/scan
        startWith('initial' as any),
        scan((accumulated: T, current: T | pureFn<T>) => {
          let data: any = accumulated;
          const dataIds = {};

          this.streams[streamId].type = 'unknown';

          // I don't think we still have uss cases were current is a function
          // instead of a value (was an early experiment)
          // so I wouldn't worry too much about this line.
          // It's safe to assume current will always be an object or an array, as opposed to a function.
          // If you're feeling brave you could try removing it and try data = current instead :).
          data = isFunction(current) ? current(data) : current;

          if (isObject(data) && !isEmpty(data)) {
            const innerData = data['data'];

            // endpoints that return an array of objects
            if (isArray(innerData)) {
              this.streams[streamId].type = 'arrayOfObjects';
              // loop through the array of objects
              innerData
                .filter((item) => has(item, 'id'))
                .forEach((item) => {
                  const dataId = item.id;
                  dataIds[dataId] = true;
                  if (cacheStream) {
                    // write the endpoint response to the key-value object cache
                    // first deepfreeze it to guarantee immutability
                    this.resourcesByDataId[dataId] = this.deepFreeze({
                      data: item,
                    });
                  }
                  // create an index for the stream by its dataId
                  this.addStreamIdByDataIdIndex(
                    streamId,
                    isQueryStream,
                    dataId
                  );
                });
            }
            // endpoints that return a single object
            else if (isObject(innerData) && has(innerData, 'id')) {
              const dataId = innerData['id'];
              this.streams[streamId].type = 'singleObject';
              dataIds[dataId] = true;
              if (cacheStream) {
                // write the endpoint response to the key-value object cache
                // first deepfreeze it to guarantee immutability
                this.resourcesByDataId[dataId] = this.deepFreeze({
                  data: innerData,
                });
              }
              // create an index for the stream by its dataId
              this.addStreamIdByDataIdIndex(streamId, isQueryStream, dataId);
            }

            // Important: also loop through any included data and put in it the key-value object cache
            if (has(data, 'included')) {
              data['included']
                .filter((item) => item.id)
                .forEach((item) => {
                  this.resourcesByDataId[item.id] = this.deepFreeze({
                    data: item,
                  });
                });

              // Important: remove the included object after it's been cached!
              // Note: We do this because we do never want to access data through
              // the included attribute.
              // Instead what we want to do is create a separate stream whenever
              // we want to access data that migth already have been included in a previous response.
              // When the stream gets initiated it will check if the data is already
              // present in the cache. If so, it will use the cache and not make a redundant request.
              // This way we can keep the 'clean' abstraction of having separate
              // streams for separate pieces of data while limiting requests and being able to use
              // included data to their full potential.
              // TL;DR: always cache and remove included data, never read it directly
              // from a response!
              data = omit(data, 'included');
            }
          }

          this.streams[streamId].dataIds = dataIds;

          return this.deepFreeze(data);
        }),
        filter((data) => data !== 'initial'),
        distinctUntilChanged(),
        publishReplay(1),
        refCount()
      );

      // this is the container for the entire stream that holds both the 'pipe' (= observable),
      // the pump (= observer), utility functions (fetch) and metadata (params, streamId, isQueryStream, etc...)
      this.streams[streamId] = {
        params,
        fetch,
        observer,
        observable,
        streamId,
        isQueryStream,
        isSearchQuery,
        isSingleItemStream,
        cacheStream,
        type: 'unknown',
        dataIds: {},
      };

      this.addStreamIdByApiEndpointIndex(apiEndpoint, streamId, isQueryStream);

      if (cacheStream) {
        // here we subscribe to the stream if it should be cached,
        // to make sure there at any give time at least 1 subscriber
        // (you can kind of view this as being similar to a subscription to the stream in App.tsx...
        // it will stay subscribed as long as the user is on the platform)
        this.streams[streamId].subscription = this.streams[
          streamId
        ].observable.subscribe();
      }

      return this.streams[streamId] as IStream<T>;
    }

    return this.streams[streamId] as IStream<T>;
  }

  async add<T>(
    unsafeApiEndpoint: string,
    bodyData: object | null,
    waitForRefetchesToResolve = false
  ) {
    const apiEndpoint = this.removeTrailingSlash(unsafeApiEndpoint);

    try {
      const promises: Promise<any>[] = [];
      const response = await request<T>(
        apiEndpoint,
        bodyData,
        { method: 'POST' },
        null
      );

      forEach(
        this.streamIdsByApiEndPointWithoutQuery[apiEndpoint],
        (streamId) => {
          const stream = this.streams[streamId];

          if (
            stream.cacheStream &&
            stream.type === 'singleObject' &&
            !isEmpty(response?.['data']) &&
            !isArray(response?.['data'])
          ) {
            stream.observer.next(this.deepFreeze(response));
          } else if (
            stream.cacheStream &&
            stream.type === 'arrayOfObjects' &&
            !isEmpty(response?.['data'])
          ) {
            stream.observer.next((previous) => {
              let data: any;

              if (isArray(response['data'])) {
                data = [...previous?.data, ...response['data']];
              } else {
                data = [...previous?.data, response['data']];
              }

              return this.deepFreeze({
                ...previous,
                data,
              });
            });
          } else {
            promises.push(stream.fetch());
          }
        }
      );

      forEach(this.streamIdsByApiEndPointWithQuery[apiEndpoint], (streamId) => {
        promises.push(this.streams[streamId].fetch());
      });

      if (waitForRefetchesToResolve) {
        await Promise.all(promises);
      }

      return response;
    } catch (error) {
      if (!error.json || !error.json.errors) {
        reportError(error);
      }
      return Promise.reject(error);
    }
  }

  async update<T>(
    unsafeApiEndpoint: string,
    dataId: string,
    bodyData: object,
    waitForRefetchesToResolve = false
  ) {
    const apiEndpoint = this.removeTrailingSlash(unsafeApiEndpoint);

    try {
      const promises: Promise<any>[] = [];
      const response = await request<T>(
        apiEndpoint,
        bodyData,
        { method: 'PATCH' },
        null
      );

      union(
        this.streamIdsByDataIdWithoutQuery[dataId],
        this.streamIdsByApiEndPointWithoutQuery[apiEndpoint]
      ).forEach((streamId) => {
        const stream = this.streams[streamId];
        const streamHasDataId = has(stream, `dataIds.${dataId}`);

        if (!stream.cacheStream) {
          promises.push(stream.fetch());
        } else if (streamHasDataId && stream.type === 'singleObject') {
          stream.observer.next(response);
        } else if (streamHasDataId && stream.type === 'arrayOfObjects') {
          stream.observer.next((previous) =>
            this.deepFreeze({
              ...previous,
              data: previous.data.map((child) =>
                child.id === dataId ? response['data'] : child
              ),
            })
          );
        }
      });

      union(
        this.streamIdsByApiEndPointWithQuery[apiEndpoint],
        this.streamIdsByDataIdWithQuery[dataId]
      ).forEach((streamId) => {
        promises.push(this.streams[streamId].fetch());
      });

      if (waitForRefetchesToResolve) {
        await Promise.all(promises);
      }

      return response;
    } catch (error) {
      if (!error.json || !error.json.errors) {
        reportError(error);
      }

      return Promise.reject(error);
    }
  }

  async delete(
    unsafeApiEndpoint: string,
    dataId: string,
    waitForRefetchesToResolve = false
  ) {
    const apiEndpoint = this.removeTrailingSlash(unsafeApiEndpoint);

    try {
      const promises: Promise<any>[] = [];

      await request(apiEndpoint, null, { method: 'DELETE' }, null);

      union(
        this.streamIdsByDataIdWithoutQuery[dataId],
        this.streamIdsByApiEndPointWithoutQuery[apiEndpoint]
      ).forEach((streamId) => {
        const stream = this.streams[streamId];
        const streamHasDataId = has(stream, `dataIds.${dataId}`);

        if (stream && !stream.cacheStream) {
          promises.push(stream.fetch());
        } else if (streamHasDataId && stream.type === 'singleObject') {
          stream.observer.next(undefined);
        } else if (streamHasDataId && stream.type === 'arrayOfObjects') {
          stream.observer.next((previous) =>
            this.deepFreeze({
              ...previous,
              data: previous.data.filter((child) => child.id !== dataId),
            })
          );
        }
      });

      union(
        this.streamIdsByApiEndPointWithQuery[apiEndpoint],
        this.streamIdsByDataIdWithQuery[dataId]
      ).forEach((streamId) => {
        promises.push(this.streams[streamId].fetch());
      });

      if (waitForRefetchesToResolve) {
        await Promise.all(promises);
      }

      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(error);
      }

      if (!error.json || !error.json.errors) {
        reportError(error);
      }

      return Promise.reject(error);
    }
  }

  async fetchAllWith({
    dataId,
    apiEndpoint,
    partialApiEndpoint,
    regexApiEndpoint,
    onlyFetchActiveStreams,
  }: {
    dataId?: string[];
    apiEndpoint?: string[];
    partialApiEndpoint?: string[];
    regexApiEndpoint?: RegExp[];
    onlyFetchActiveStreams?: boolean;
  }) {
    const keys = [...(dataId || []), ...(apiEndpoint || [])];
    const promises: Promise<any>[] = [];

    const streamIds1 = flatten(
      keys.map((key) => [
        ...(this.streamIdsByDataIdWithQuery[key] || []),
        ...(this.streamIdsByDataIdWithoutQuery[key] || []),
        ...(this.streamIdsByApiEndPointWithQuery[key] || []),
        ...(this.streamIdsByApiEndPointWithoutQuery[key] || []),
      ])
    );

    const streamIds2: string[] = [];
    if (partialApiEndpoint && partialApiEndpoint.length > 0) {
      forOwn(this.streamIdsByApiEndPointWithQuery, (_value, key) => {
        partialApiEndpoint.forEach((endpoint) => {
          if (
            key.includes(endpoint) &&
            this.streamIdsByApiEndPointWithQuery[key]
          ) {
            streamIds2.push(...this.streamIdsByApiEndPointWithQuery[key]);
          }
        });
      });

      forOwn(this.streamIdsByApiEndPointWithoutQuery, (_value, key) => {
        partialApiEndpoint.forEach((endpoint) => {
          if (
            key.includes(endpoint) &&
            this.streamIdsByApiEndPointWithoutQuery[key]
          ) {
            streamIds2.push(...this.streamIdsByApiEndPointWithoutQuery[key]);
          }
        });
      });
    }

    const streamIds3: string[] = [];
    if (regexApiEndpoint && regexApiEndpoint.length > 0) {
      forOwn(this.streamIdsByApiEndPointWithQuery, (_value, key) => {
        regexApiEndpoint.forEach((regex) => {
          if (regex.test(key) && this.streamIdsByApiEndPointWithQuery[key]) {
            streamIds3.push(...this.streamIdsByApiEndPointWithQuery[key]);
          }
        });
      });

      forOwn(this.streamIdsByApiEndPointWithoutQuery, (_value, key) => {
        regexApiEndpoint.forEach((regex) => {
          if (regex.test(key) && this.streamIdsByApiEndPointWithoutQuery[key]) {
            streamIds3.push(...this.streamIdsByApiEndPointWithoutQuery[key]);
          }
        });
      });
    }

    const mergedStreamIds = [...streamIds1, ...streamIds2, ...streamIds3];

    if (includes(keys, authApiEndpoint)) {
      mergedStreamIds.push(authApiEndpoint);
    }

    uniq(mergedStreamIds).forEach((streamId) => {
      if (!onlyFetchActiveStreams || this.isActiveStream(streamId)) {
        promises.push(this.streams[streamId].fetch());
      }
    });

    return await Promise.all(promises);
  }
}

const streams = new Streams();
export default streams;
