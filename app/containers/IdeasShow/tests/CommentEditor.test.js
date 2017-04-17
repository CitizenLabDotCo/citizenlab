import React from 'react';
import { shallow } from 'enzyme';
import CommentEditor from '../CommentEditor';

describe('<CommentEditor />', () => {
  const jestFn = jest.fn();
  const wrapper = shallow(<CommentEditor
    onEditorChange={jestFn}
    resetContent
    parentId={'anything'}
  />);

  it('should render the RTE', () => {
    expect(wrapper.find('t').length).toEqual(1);
  });
});
