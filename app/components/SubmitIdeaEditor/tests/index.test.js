import { shallow } from 'enzyme';
import React from 'react';
import SubmitIdeaEditor from '../index';

describe('<SubmitIdeaEditor />', () => {
  it('editor should render', () => {
    const jestFn = jest.fn();
    const props = {
      loadDraft: jestFn,
      onEditorChange: jestFn,
    };

    const tree = shallow(<SubmitIdeaEditor {...props} />);
    expect(tree.find('e')).toHaveLength(1);
  });
});
