// @ts-nocheck
// libraries
import React from 'react';
import { shallow } from 'enzyme';

// component to test
import GetCommentsForUser from './GetCommentsForUser';

// mocks
import {
  commentsForUserStream,
  __setMockCommentsForUser,
  makeComments,
} from 'services/comments';
// typescript struggles when using both mocked things and real ones
// this the way I found to minimize the errors, and to have autocomplethin on the .mock object

jest.mock('services/comments');
jest.mock('modules', () => ({ streamsToReset: [] }));

describe('<GetCommentsForUser />', () => {
  let child: jest.Mock;

  beforeEach(() => {
    jest.mock('services/comments');

    child = jest.fn();
    child.mockReset();
  });

  it('calls the commentsForUserStream stream with the given user id', () => {
    shallow(<GetCommentsForUser userId="id1">{child}</GetCommentsForUser>);
    expect(commentsForUserStream.mock.calls[0][0]).toEqual('id1');
  });

  it('passes an undefined commmentsList to the child function initially', () => {
    shallow(<GetCommentsForUser userId="id2">{child}</GetCommentsForUser>);
    expect(child.mock.calls[0][0].commentsList).toEqual(undefined);
  });

  it('passes the data to the child function received from the streams', () => {
    shallow(<GetCommentsForUser userId="id3">{child}</GetCommentsForUser>);
    const commentsList = makeComments([{ id: 'comment1' }]);
    __setMockCommentsForUser(commentsList);
    expect(
      child.mock.calls[child.mock.calls.length - 1][0].commentsList
    ).toEqual(commentsList.data);
  });

  it('passes and Error to the child function when it receives and Error from the streams', () => {
    shallow(<GetCommentsForUser userId="id4">{child}</GetCommentsForUser>);
    const error = new Error();
    __setMockCommentsForUser(error);
    expect(
      child.mock.calls[child.mock.calls.length - 1][0].commentsList
    ).toEqual(error);
  });

  it('adds new comments on load more', () => {
    shallow(<GetCommentsForUser userId="id5">{child}</GetCommentsForUser>);
    const commentsList1 = makeComments([{ id: 'comment1' }]);
    commentsList1.links = {
      self: 'api/comments/page1',
      first: 'api/comments/page1',
      prev: '',
      next: 'api/comments/page2',
      last: 'api/comments/page3',
    };
    __setMockCommentsForUser(commentsList1);

    expect(
      child.mock.calls[child.mock.calls.length - 1][0].commentsList
    ).toEqual(commentsList1.data);

    child.mock.calls[child.mock.calls.length - 1][0].loadMore();
    const commentsList2 = makeComments([{ id: 'comment2' }]);
    __setMockCommentsForUser(commentsList2);

    expect(
      child.mock.calls[child.mock.calls.length - 1][0].commentsList
    ).toEqual([...commentsList1.data, ...commentsList2.data]);
  });

  // it('reacts correctly to a userId change', () => {
  //   let userId = 'id6';
  //   const wrapper = shallow(<GetCommentsForUser userId={userId}>{child}</GetCommentsForUser>);
  //
  //   expect(commentsForUserStream.mock.calls[0][0]).toEqual('id6');
  //
  //   userId = 'id7';
  //
  //   wrapper.setProps({ userId: 'id7' });
  //   wrapper.update();
  //
  //   expect(commentsForUserStream.mock.calls).toMatchSnapshot();
  //
  // });
});
