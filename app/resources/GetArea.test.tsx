import React from 'react';
import { shallow } from 'enzyme';
import GetArea from './GetArea';
import { __setMockIdea, areaByIdStream } from 'services/areas';
jest.mock('services/areas');

describe('<GetArea />', () => {

  let child: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
  });

  it('call the area stream with the given id', () => {
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(areaByIdStream.mock.calls[0][0]).toEqual('someId');

  });

  it('passes undefined to the child function initially', () => {
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[0][0]).toBeUndefined;
  });

  it('passes the idea data received from the streams to the child function', () => {
    const mockIdea = {
      data: { some: 'data' }
    };
    __setMockIdea(mockIdea);

    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[1][0]).toEqual(mockIdea.data);
  });

  it('passes null to the child function when it receives null from the streams', () => {
    __setMockIdea(null);
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[1][0]).toBeNull;
  });

  it('passes and Error to the child function when it receives and Error from the streams', () => {
    const error = new Error();
    __setMockIdea(new Error());
    shallow(<GetArea id="someId">{child}</GetArea>);
    expect(child.mock.calls[1][0]).toEqual(error);
  });

});
