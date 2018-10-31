import React from 'react';
import { shallow } from 'enzyme';
import GetArea from './GetArea';
import request, { __setResponseFor } from 'utils/request';
jest.mock('utils/request');
jest.mock('services/auth');

// Integration tests

describe('GetArea with streams', () => {
  let child: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
  });

  it('passes the idea data to the child function received from the request', () => {
    const httpResponse = {
      data: {
        id: 'f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb',
        type: 'areas',
        attributes: {
          title_multiloc: {
            en: 'Westside',
            'nl-BE': 'Westerbuurt'
          },
          description_multiloc: {
            en: '<p>A <i>calm</i> space to relax, where the city meets the woods.</p>',
            'nl-BE': '<p>Een <i>kalme</i> buurt om te relaxen, waar de stad en het bos samensmelten.</p>'
          }
        }
      }
    };
    __setResponseFor('/web_api/v1/areas/f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb', httpResponse);

    shallow(<GetArea id="f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb">{child}</GetArea>);
    expect(request.mock.calls[0][0]).toEqual('/web_api/v1/areas/f93ad1a1-3a0c-4c3d-b225-e1b63ca782cb');
    expect(child.mock.calls[0][0]).toBeUndefined;
    expect(child.mock.calls[1][0]).toEqual(httpResponse.data);
  });

});
