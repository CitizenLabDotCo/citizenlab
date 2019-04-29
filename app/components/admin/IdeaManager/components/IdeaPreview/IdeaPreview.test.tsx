import React from 'react';
import { shallow } from 'enzyme';

import IdeaPreview from './';

jest.mock('utils/cl-intl');
jest.mock('scroll-to', () => {});
jest.mock('services/permissions', () => {});

describe('<IdeaPreview />', () => {
  let closeSideModal: jest.Mock;
  beforeEach(() => {
    closeSideModal = jest.fn();
  });

  it('renders correctly closed', () => {
    const wrapper = shallow(
      <IdeaPreview
        closeSideModal={closeSideModal}
        ideaId={undefined}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders the idea content initially', () => {
    const wrapper = shallow(
      <IdeaPreview
        closeSideModal={closeSideModal}
        ideaId="greatIdea"
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders the idea edit correctly when asked to', () => {
    const wrapper = shallow(
      <IdeaPreview
        closeSideModal={closeSideModal}
        ideaId="greatIdea"
      />
    );
    wrapper.find('WrappedIdeaContent').prop('handleClickEdit')();
    expect(wrapper).toMatchSnapshot();
  });

  it('changes back to content when asked to', () => {
    const wrapper = shallow(
      <IdeaPreview
        closeSideModal={closeSideModal}
        ideaId="greatIdea"
      />
    );
    wrapper.find('WrappedIdeaContent').prop('handleClickEdit')();
    wrapper.find('WrappedIdeaEdit').prop('goBack')();
    expect(wrapper.find('WrappedIdeaContent')).toHaveLength(1);
  });
});
