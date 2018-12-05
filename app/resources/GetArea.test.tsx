jest.mock('services/areas');
import React from 'react';
import { shallow } from 'enzyme';
import GetArea from './GetArea';
import * as areaServices from 'services/areas';
import { __setResponseFor } from 'utils/__mocks__/request';

const areaByIdStream = areaServices.areaByIdStream as jest.Mock;
const __setMockArea = areaServices.__setMockArea;

describe('<GetArea />', () => {

  let child: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
  });

  it('calls the area stream with the given id', () => {
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(areaByIdStream.mock.calls[0][0]).toEqual('someId');
  });

  it('passes undefined to the child function initially', () => {
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[0][0]).toBeUndefined;
  });

  it('passes the idea data to the child function received from the streams', () => {
    const mockArea = {
      data: { some: 'data' }
    };
    __setMockArea(mockArea);

    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[1][0]).toEqual(mockArea.data);
  });

  it('passes null to the child function when it receives null from the streams', () => {
    __setMockArea(null);
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[1][0]).toBeNull;
  });

  it('passes and Error to the child function when it receives and Error from the streams', () => {
    const error = new Error();
    __setMockArea(error);
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[1][0]).toEqual(error);
  });

});
