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
    this.streams = {};
    this.resourcesByDataId = {};
    this.streamIdsByApiEndPointWithQuery = {};
    this.streamIdsByApiEndPointWithoutQuery = {};
    this.streamIdsByDataIdWithoutQuery = {};
    this.streamIdsByDataIdWithQuery = {};
  }

  async reset() {
    this.resourcesByDataId = {};

    const promises: Promise<any>[] = [];
    const promisesToAwait: Promise<any>[] = [];

    const rootStreamIds = [authApiEndpoint, currentAppConfigurationEndpoint];

    rootStreamIds.forEach((rootStreamId) => {
      promisesToAwait.push(this.streams[rootStreamId].fetch());
    });

    Object.keys(this.streams).forEach((streamId) => {
      if (
        !includes(rootStreamIds, streamId) &&
        !streamId.endsWith('/users/custom_fields/schema')
      ) {
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
      await Promise.all(promisesToAwait);
      Promise.all(promises);
    } finally {
      // eslint-disable-next-line no-unsafe-finally
      return true;
    }
  }

  deepFreeze<T>(object: T): T {
    let frozenObject = object;

    if (frozenObject && !Object.isFrozen(frozenObject)) {
      let property;
      let propertyKey;

      frozenObject = Object.freeze(object);

      for (propertyKey in frozenObject) {
        if (
          // eslint-disable-next-line no-prototype-builtins
          (frozenObject as Record<string, any>).hasOwnProperty(propertyKey)
        ) {
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

  isActiveStream(streamId: string) {
    const refCount = cloneDeep(
      this.streams[streamId].observable.source['_refCount']
    );
    const isCacheStream = cloneDeep(this.streams[streamId].cacheStream);

    if ((isCacheStream && refCount > 1) || (!isCacheStream && refCount > 0)) {
      return true;
    }

    return false;
  }

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

  isSingleItemStream(lastUrlSegment: string, isQueryStream: boolean) {
    if (!isQueryStream) {
      return isUUID(lastUrlSegment);
    }

    return false;
  }

  removeTrailingSlash(apiEndpoint: string) {
    return apiEndpoint.replace(/\/$/, '');
  }

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
    const isSearchQuery =
      isQueryStream &&
      queryParameters &&
      queryParameters['search'] &&
      isString(queryParameters['search']) &&
      !isEmpty(queryParameters['search']);
    const cacheStream =
      isSearchQuery || inputParams.cacheStream === false ? false : true;
    const streamId = this.getStreamId(
      apiEndpoint,
      isQueryStream,
      queryParameters,
      cacheStream
    );

    if (!has(this.streams, streamId)) {
      const { bodyData } = params;
      const lastUrlSegment = apiEndpoint.substr(
        apiEndpoint.lastIndexOf('/') + 1
      );
      const isSingleItemStream = this.isSingleItemStream(
        lastUrlSegment,
        isQueryStream
      );
      const observer: IObserver<T | null> = null as any;
      // const apiEndPointWithoutCacheParam = apiEndpoint.replace('?cached=false', '');

      const fetch = () => {
        return request<any>(
          apiEndpoint,
          bodyData,
          { method: 'GET' },
          queryParameters
        )
          .then((response) => {
            this.streams?.[streamId]?.observer?.next(response);
            return response;
          })
          .catch((error) => {
            if (
              streamId !== authApiEndpoint &&
              streamId !== currentOnboardingCampaignsApiEndpoint
            ) {
              this.streams[streamId].observer.next(error);
              this.deleteStream(streamId, apiEndpoint);
              reportError(error);
              throw error;
            } else if (streamId === authApiEndpoint) {
              this.streams[streamId].observer.next(null);
            }

            return null;
          });
      };

      const observable = new Observable<T | null>((observer) => {
        const dataId = lastUrlSegment;

        if (this.streams[streamId]) {
          this.streams[streamId].observer = observer;
        }

        if (
          cacheStream &&
          isSingleItemStream &&
          has(this.resourcesByDataId, dataId)
        ) {
          observer.next(this.resourcesByDataId[dataId]);
        } else {
          fetch();
        }

        return () => {
          this.deleteStream(streamId, apiEndpoint);
        };
      }).pipe(
        startWith('initial' as any),
        scan((accumulated: T, current: T | pureFn<T>) => {
          let data: any = accumulated;
          const dataIds = {};

          this.streams[streamId].type = 'unknown';

          data = isFunction(current) ? current(data) : current;

          if (isObject(data) && !isEmpty(data)) {
            const innerData = data['data'];

            if (isArray(innerData)) {
              this.streams[streamId].type = 'arrayOfObjects';
              innerData
                .filter((item) => has(item, 'id'))
                .forEach((item) => {
                  const dataId = item.id;
                  dataIds[dataId] = true;
                  if (cacheStream) {
                    this.resourcesByDataId[dataId] = this.deepFreeze({
                      data: item,
                    });
                  }
                  this.addStreamIdByDataIdIndex(
                    streamId,
                    isQueryStream,
                    dataId
                  );
                });
            } else if (isObject(innerData) && has(innerData, 'id')) {
              const dataId = innerData['id'];
              this.streams[streamId].type = 'singleObject';
              dataIds[dataId] = true;
              if (cacheStream) {
                this.resourcesByDataId[dataId] = this.deepFreeze({
                  data: innerData,
                });
              }
              this.addStreamIdByDataIdIndex(streamId, isQueryStream, dataId);
            }

            if (has(data, 'included')) {
              data['included']
                .filter((item) => item.id)
                .forEach((item) => {
                  this.resourcesByDataId[item.id] = this.deepFreeze({
                    data: item,
                  });
                });

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
        // keep stream hot
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
    bodyData: Record<string, any> | null,
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
    bodyData: Record<string, any>,
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
        // eslint-disable-next-line no-console
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
