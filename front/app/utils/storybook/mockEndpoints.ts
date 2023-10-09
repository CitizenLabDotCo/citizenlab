import defaultEndpoints from '../../../.storybook/mockServer';
import {
  RestRequest,
  PathParams,
  ResponseComposition,
  DefaultBodyType,
  RestContext,
  AsyncResponseResolverReturnType,
  MockedResponse,
} from 'msw';

type Endpoint = keyof typeof defaultEndpoints;
type Handler = (typeof defaultEndpoints)[Endpoint];

const mockEndpoints = (mockedEndpoints: Partial<Record<Endpoint, Handler>>) =>
  Object.values({
    ...defaultEndpoints,
    ...mockedEndpoints,
  });

export type EndpointMock = (
  req: RestRequest<never, PathParams<string>>,
  res: ResponseComposition<DefaultBodyType>,
  ctx: RestContext
) => AsyncResponseResolverReturnType<MockedResponse<DefaultBodyType>>;

export default mockEndpoints;
