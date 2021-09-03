// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import GetIdeas from './GetIdeas';

// mocks
import * as ideasServices from 'services/ideas';
// typescript struggles when using both mocked things and real ones
// this the way I found to minimize the errors, and to have autocomplethin on the .mock object
const ideasStream = ideasServices.ideasStream as jest.Mock;
const __setMockIdeas = ideasServices.__setMockIdeas;

jest.mock('services/ideas');
jest.mock('services/projects');

describe('<GetIdeas sort="new" />', () => {
  let child: jest.Mock;

  beforeEach(() => {
    child = jest.fn();
  });

  it('calls the ideasStream stream', () => {
    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(ideasStream).toHaveBeenCalled();
  });

  it('calls the ideasStream stream whith the passed in parameters', () => {
    shallow(
      <GetIdeas sort="new" assignee="User_ID" feedbackNeeded={true}>
        {child}
      </GetIdeas>
    );
    expect(ideasStream.mock.calls[0][0].queryParameters.assignee).toEqual(
      'User_ID'
    );
    expect(
      ideasStream.mock.calls[0][0].queryParameters.feedback_needed
    ).toEqual(true);
    expect(ideasStream.mock.calls[0][0].queryParameters.project_id).toEqual(
      undefined
    );
  });

  it('passes undefined to the child function initially', () => {
    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(child.mock.calls[0][0].list).toBeUndefined;
  });

  it('passes the idea data to the child function received from the streams', () => {
    const mockIdeas = {
      data: ['Idea1', 'Idea2'].map((name) => ideasServices.getIdea(name, name)),
    };
    __setMockIdeas(mockIdeas);

    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(
      child.mock.calls.find((arr) => arr[0].list !== undefined)[0].list
    ).toEqual(mockIdeas.data);
  });

  it('passes the idea data to the child function received from the streams', () => {
    const mockIdeas = {
      data: [],
    };
    __setMockIdeas(mockIdeas);

    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(
      child.mock.calls.find((arr) => arr[0].list !== undefined)[0].list
    ).toEqual(mockIdeas.data);
  });

  it('passes null to the child function when it receives null from the streams', () => {
    __setMockIdeas(null);
    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(child.mock.calls[1][0].list).toBeNull;
  });

  it('passes undefined to the child function when it receives Error from the streams', () => {
    const error = new Error();
    __setMockIdeas(error);
    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(child.mock.calls[1][0].list).toBeUndefined;
  });

  it('reacts to assignee filter change', () => {
    const mockIdeas = {
      data: [],
    };
    __setMockIdeas(mockIdeas);
    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(ideasStream.mock.calls[0][0].queryParameters.assignee).toEqual(
      undefined
    );
    child.mock.calls[1][0].onChangeAssignee('User_ID');

    __setMockIdeas(null);
    expect(ideasStream.mock.calls[1][0].queryParameters.assignee).toEqual(
      'User_ID'
    );
    expect(child.mock.calls[2][0].list).toBeNull;
  });

  it('reacts to page change', () => {
    const mockIdeas = {
      data: [],
    };
    __setMockIdeas(mockIdeas);
    shallow(<GetIdeas sort="new">{child}</GetIdeas>);
    expect(
      ideasStream.mock.calls[0][0].queryParameters['page[number]']
    ).toEqual(1);
    child.mock.calls[1][0].onChangePage(2);

    __setMockIdeas(null);
    expect(
      ideasStream.mock.calls[1][0].queryParameters['page[number]']
    ).toEqual(2);
  });
});
