// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import GetCommentsForUser from './GetCommentsForUser';

// mocks
import { commentsForUserStream, __setMockCommentsForUser, makeComments } from 'services/comments';
// typescript struggles when using both mocked things and real ones
// this the way I found to minimize the errors, and to have autocomplethin on the .mock object

jest.mock('services/comments');

describe('<GetCommentsForUser />', () => {

  let child: jest.Mock;

  beforeEach(() => {
    jest.mock('services/comments');

    child = jest.fn();
  });

  it('calls the commentsForUserStream stream with the given user id', () => {
    shallow(<GetCommentsForUser userId="someId">{child}</GetCommentsForUser>);
    expect(commentsForUserStream.mock.calls[0][0]).toEqual('someId');
  });

  it('passes an undefined list to the child function initially', () => {
    shallow(<GetCommentsForUser userId="anotherId">{child}</GetCommentsForUser>);
    expect(child.mock.calls[0][0].commentsList).toEqual(undefined);
  });

  it('passes the data to the child function received from the streams', () => {
    shallow(<GetCommentsForUser userId="yetAnother">{child}</GetCommentsForUser>);
    const commentsList = makeComments([{}]);
    __setMockCommentsForUser(commentsList);
    expect(child.mock.calls[2][0].commentsList).toEqual(commentsList.data);
  });

  it('passes and Error to the child function when it receives and Error from the streams', () => {
    shallow(<GetCommentsForUser userId="someId">{child}</GetCommentsForUser>);
    const error = new Error;
    __setMockCommentsForUser(error);
    expect(child.mock.calls[2][0].commentsList).toEqual(error);
  });

  it('adds new comments on load more', () => {
    shallow(<GetCommentsForUser userId="someId">{child}</GetCommentsForUser>);
    const commentsList = makeComments([{}]);
    __setMockCommentsForUser(commentsList);
    expect(child.mock.calls[2][0].commentsList).toEqual(commentsList.data);
    child.mock.calls[2][0].loadMore();
    __setMockCommentsForUser(commentsList);

    expect(child.mock.calls[3][0].commentsList).toEqual([...commentsList.data, ...commentsList.data]);

  });
});
