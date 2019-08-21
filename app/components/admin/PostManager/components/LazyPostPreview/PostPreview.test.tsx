import React from 'react';
import { shallow } from 'enzyme';

jest.mock('./Idea/LazyIdeaEdit', () => 'LazyIdeaEdit');
jest.mock('./Idea/LazyIdeaContent', () => 'LazyIdeaContent');
jest.mock('./Initiative/InitiativeContent', () => 'InitiativeContent');
jest.mock('./Initiative/InitiativeEdit', () => 'InitiativeEdit');

import PostPreview from './PostPreview';

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
    expect(Wrapper).toMatchSnapshot();
    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(false);
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
    expect(Wrapper).toMatchSnapshot();

    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(true);
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
    expect(Wrapper).toMatchSnapshot();

    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(true);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(false);
  });

});
