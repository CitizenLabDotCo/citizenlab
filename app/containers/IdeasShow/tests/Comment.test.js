import React from 'react';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import configureMockStore from 'redux-mock-store';

import state from './state.sample.json';
import Comments from '../components/comments';

describe('<Comment />', () => {
  it('should render a list of nested comments', () => {
    const comments = renderer.create(
      <Provider store={configureMockStore([])(fromJS(state))}>
        <Comments />
      </Provider>
    ).toJSON();
    expect(comments).toMatchSnapshot();
  });
});
