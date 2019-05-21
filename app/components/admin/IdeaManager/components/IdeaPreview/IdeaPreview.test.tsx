import React from 'react';
import { shallow } from 'enzyme';

import IdeaPreview from './';

jest.mock('utils/cl-intl');
jest.mock('scroll-to', () => {});
jest.mock('services/permissions', () => {});

describe('<IdeaPreview />', () => {
  let closeSideModal: jest.Mock;
  let onSwitchIdeaMode: jest.Mock;
  beforeEach(() => {
    closeSideModal = jest.fn();
    onSwitchIdeaMode = jest.fn();
  });

  it('renders correctly closed', () => {
    const wrapper = shallow(
      <IdeaPreview
        onCloseModal={closeSideModal}
        ideaId={null}
        onSwitchIdeaMode={onSwitchIdeaMode}
        mode="view"
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders the idea content initially', () => {
    const wrapper = shallow(
      <IdeaPreview
        onCloseModal={closeSideModal}
        ideaId="GreatIdea"
        onSwitchIdeaMode={onSwitchIdeaMode}
        mode="view"
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders the idea edit correctly', () => {
    const wrapper = shallow(
      <IdeaPreview
        onCloseModal={closeSideModal}
        ideaId="GreatIdea"
        onSwitchIdeaMode={onSwitchIdeaMode}
        mode="edit"
      />
    );
    expect(wrapper).toMatchSnapshot();
  });

  it('calls the correct handler to switch to edit mode', () => {
    const wrapper = shallow(
      <IdeaPreview
        onCloseModal={closeSideModal}
        ideaId="GreatIdea"
        onSwitchIdeaMode={onSwitchIdeaMode}
        mode="view"
      />
    );
    wrapper.find('WrappedIdeaContent').prop('handleClickEdit')();
    expect(onSwitchIdeaMode).toHaveBeenCalledTimes(1);
  });

  it('calls the correct handler to switch to view mode', () => {
    const wrapper = shallow(
      <IdeaPreview
        onCloseModal={closeSideModal}
        ideaId="GreatIdea"
        onSwitchIdeaMode={onSwitchIdeaMode}
        mode="edit"
      />
    );
    wrapper.find('WrappedIdeaEdit').prop('goBack')();
    expect(onSwitchIdeaMode).toHaveBeenCalledTimes(1);
  });
});
