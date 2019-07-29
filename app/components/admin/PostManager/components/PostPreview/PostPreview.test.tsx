import React from 'react';
import { shallow } from 'enzyme';

jest.mock('components/UI/SideModal', () => 'SideModal');
jest.mock('./IdeaContent', () => 'IdeaContent');
jest.mock('./IdeaEdit', () => 'IdeaEdit');

import PostPreview from './';

describe('<PostPreview />', () => {
  let closePreview: jest.Mock;
  let onSwitchPreviewMode: jest.Mock;
  beforeEach(() => {
    closePreview = jest.fn();
    onSwitchPreviewMode = jest.fn();
  });

  it('renders correctly closed', () => {
    const Wrapper = shallow(
      <PostPreview
        type="AllIdeas"
        onClose={closePreview}
        postId={null}
        onSwitchPreviewMode={onSwitchPreviewMode}
        mode="view"
      />
    );
    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('IdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('IdeaContent').exists()).toBe(false);
  });

  it('renders idea content', () => {
    const Wrapper = shallow(
      <PostPreview
        type="ProjectIdeas"
        onClose={closePreview}
        postId="GreatIdea"
        onSwitchPreviewMode={onSwitchPreviewMode}
        mode="view"
      />
    );
    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('IdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('IdeaContent').exists()).toBe(true);
  });

  it('renders idea edit', () => {
    const Wrapper = shallow(
      <PostPreview
        type="AllIdeas"
        onClose={closePreview}
        postId="GreatIdea"
        onSwitchPreviewMode={onSwitchPreviewMode}
        mode="edit"
      />
    );
    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('IdeaEdit').exists()).toBe(true);
    expect(Wrapper.find('IdeaContent').exists()).toBe(false);
  });

});
