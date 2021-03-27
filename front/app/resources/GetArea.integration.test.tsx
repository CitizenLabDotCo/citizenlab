import React from 'react';
import { shallow } from 'enzyme';
import GetArea from './GetArea';
import request, { __setResponseFor } from 'utils/request';
jest.mock('utils/request');
jest.mock('services/auth');
jest.mock('services/appConfiguration');

/** This is an example of a potential integration test for data fetching
 * It tests the code from the resource component until the http request done by utils/request.ts
 * and everything in between (mostly streams.ts)
 *
 * To be evaluated whether this is the way to go.
 * Advantage is that coverage is high with quite low efforts.
 * Downside is that is might be too fragile.
 */

describe('GetArea with streams', () => {
  let child: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
  });

  it('passes the idea data to the child function received from the request', (done) => {
    const httpResponse = {
      data: {
        id: 'f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb',
        type: 'area',
        attributes: {
          title_multiloc: {
            en: 'Westside',
            'nl-BE': 'Westerbuurt',
          },
          description_multiloc: {
            en:
              '<p>A <i>calm</i> space to relax, where the city meets the woods.</p>',
            'nl-BE':
              '<p>Een <i>kalme</i> buurt om te relaxen, waar de stad en het bos samensmelten.</p>',
          },
        },
      },
    };
    __setResponseFor(
      '/web_api/v1/areas/f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb',
      httpResponse
    );

    shallow(
      <GetArea id="f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb">{child}</GetArea>
    );
    expect(request.mock.calls[0][0]).toEqual(
      '/web_api/v1/areas/f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb'
    );
    expect(child.mock.calls[0][0]).toBeUndefined;
    // This is a little bit hacky, but without mocking/touching streams.ts internals
    // it seems to be very hard to get hold of a promise that resolves when the
    // data should be passed in. Maybe a sign that it's not the way to go.
    setTimeout(() => {
      expect(child.mock.calls[1][0]).toEqual(httpResponse.data);
      done();
    });
  });
});
