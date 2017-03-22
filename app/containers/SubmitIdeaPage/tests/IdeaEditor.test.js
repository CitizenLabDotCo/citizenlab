import { shallow } from 'enzyme';
import React from 'react';
import IdeaEditor from '../IdeaEditor';

describe('<deaEditor />', () => {
  it('editor should render', () => {
    const jestFn = jest.fn();
    const props = {
      loadDraft: jestFn,
      onEditorChange: jestFn,
    };

    const tree = shallow(<IdeaEditor {...props} />);
    expect(tree.find('e')).toHaveLength(1);
  });
});
