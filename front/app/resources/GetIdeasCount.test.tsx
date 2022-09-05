// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import GetIdeasCount from './GetIdeasCount';

// mocks
import * as statsServices from 'services/stats';
// typescript struggles when using both mocked things and real ones
// this the way I found to minimize the errors, and to have autocomplethin on the .mock object
const ideasCount = statsServices.ideasCount as jest.Mock;
const __setMockIdeasCount = statsServices.__setMockIdeasCount;

jest.mock('services/stats');
jest.mock('services/projects');
jest.mock('modules', () => ({ streamsToReset: [] }));

describe('<GetIdeasCount />', () => {
  let child: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
  });

  it('calls the ideasCount stream', () => {
    shallow(<GetIdeasCount>{child}</GetIdeasCount>);
    expect(ideasCount).toHaveBeenCalled();
  });

  it('calls the ideasCount stream whith the passed in parameters', () => {
    shallow(
      <GetIdeasCount assignee="User_ID" feedbackNeeded={true}>
        {child}
      </GetIdeasCount>
    );
    expect(ideasCount.mock.calls[0][0].queryParameters.assignee).toEqual(
      'User_ID'
    );
    expect(ideasCount.mock.calls[0][0].queryParameters.feedback_needed).toEqual(
      true
    );
    expect(ideasCount.mock.calls[0][0].queryParameters.project_id).toEqual(
      undefined
    );
  });

  it('passes undefined to the child function initially', () => {
    shallow(<GetIdeasCount>{child}</GetIdeasCount>);
    expect(child.mock.calls[0][0].count).toBeUndefined;
  });

  it('passes the idea data to the child function received from the streams', () => {
    const mockIdeasCount = {
      count: 6,
    };
    __setMockIdeasCount(mockIdeasCount);

    shallow(<GetIdeasCount>{child}</GetIdeasCount>);
    expect(child.mock.calls[1][0].count).toEqual(mockIdeasCount.count);
  });

  it('passes null to the child function when it receives null from the streams', () => {
    __setMockIdeasCount(null);
    shallow(<GetIdeasCount>{child}</GetIdeasCount>);
    expect(child.mock.calls[1][0].count).toBeNull;
  });

  it('passes Error to the child function when it receives Error from the streams', () => {
    const error = new Error();
    __setMockIdeasCount(error);
    shallow(<GetIdeasCount>{child}</GetIdeasCount>);
    expect(child.mock.calls[1][0].count).toEqual(error);
  });

  it('reacts to assignee filter change', () => {
    const mockIdeasCount = {
      count: 6,
    };
    __setMockIdeasCount(mockIdeasCount);
    shallow(<GetIdeasCount>{child}</GetIdeasCount>);
    expect(ideasCount.mock.calls[0][0].queryParameters.assignee).toEqual(
      undefined
    );
    child.mock.calls[1][0].onChangeAssignee('User_ID');

    __setMockIdeasCount(null);
    expect(ideasCount.mock.calls[1][0].queryParameters.assignee).toEqual(
      'User_ID'
    );
    expect(child.mock.calls[2][0].count).toBeNull;
  });
});
