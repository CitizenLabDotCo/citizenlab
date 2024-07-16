import defaultEndpoints from '../../../.storybook/mockServer';

type Endpoint = keyof typeof defaultEndpoints;
type Handler = (typeof defaultEndpoints)[Endpoint];

const mockEndpoints = (mockedEndpoints: Partial<Record<Endpoint, Handler>>) =>
  Object.values({
    ...defaultEndpoints,
    ...mockedEndpoints,
  });

export default mockEndpoints;
