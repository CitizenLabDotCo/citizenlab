import React from 'react';
import { shallow } from 'enzyme';

jest.mock('components/UI/SideModal', () => 'SideModal');
jest.mock('components/UI/FullPageSpinner', () => 'FullPageSpinner');
jest.mock('./Idea/LazyIdeaEdit', () => 'LazyIdeaEdit');
jest.mock('./Idea/LazyIdeaContent', () => 'LazyIdeaContent');
jest.mock('./Initiative/LazyInitiativeEdit', () => 'LazyInitiativeEdit');
jest.mock('./Initiative/LazyInitiativeContent', () => 'LazyInitiativeContent');

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
    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(false);
    expect(Wrapper.find('LazyInitiativeEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyInitiativeContent').exists()).toBe(false);
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
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(true);
    expect(Wrapper.find('LazyInitiativeEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyInitiativeContent').exists()).toBe(false);
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
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(true);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(false);
    expect(Wrapper.find('LazyInitiativeEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyInitiativeContent').exists()).toBe(false);
  });

  it('renders initiative content', () => {
    const Wrapper = shallow(
      <PostPreview
        type="Initiatives"
        onClose={closePreview}
        postId="GreatInitiative"
        onSwitchPreviewMode={onSwitchPreviewMode}
        mode="view"
      />
    );
    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('LazyInitiativeEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyInitiativeContent').exists()).toBe(true);
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(false);
  });

  it('renders initiative edit', () => {
    const Wrapper = shallow(
      <PostPreview
        type="Initiatives"
        onClose={closePreview}
        postId="GreatInitiative"
        onSwitchPreviewMode={onSwitchPreviewMode}
        mode="edit"
      />
    );
    expect(Wrapper.find('SideModal').exists()).toBe(true);
    expect(Wrapper.find('LazyInitiativeEdit').exists()).toBe(true);
    expect(Wrapper.find('LazyInitiativeContent').exists()).toBe(false);
    expect(Wrapper.find('LazyIdeaEdit').exists()).toBe(false);
    expect(Wrapper.find('LazyIdeaContent').exists()).toBe(false);
  });
});
