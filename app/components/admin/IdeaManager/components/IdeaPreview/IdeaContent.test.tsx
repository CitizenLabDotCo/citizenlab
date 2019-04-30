import React from 'react';
import { shallow } from 'enzyme';

import { IdeaContent } from './IdeaContent';
import { makeUser } from 'services/__mocks__/users';
import { getIdea } from 'services/ideas';
import { localizeProps } from 'utils/testUtils/localizeProps';

jest.mock('utils/cl-intl');
jest.mock('resources/GetUsers');
jest.mock('services/users');
jest.mock('services/ideas');
jest.mock('scroll-to', () => {});
jest.mock('services/permissions', () => {});
jest.mock('./', () => ({ Top: () => {}, Content: () => {}, Container: () => {} }));
jest.mock('resources/GetResourceFiles', () => {});
jest.mock('resources/GetIdeaImages', () => {});

import { intl } from 'utils/cl-intl';

describe('<IdeaContent />', () => {
  let closeSideModal: jest.Mock;
  let handleClickEdit: jest.Mock;
  beforeEach(() => {
    closeSideModal = jest.fn();
    handleClickEdit = jest.fn();
  });

  it('renders correctly when ideaId is not defined', () => {
    const wrapper = shallow(
      <IdeaContent
        closeSideModal={closeSideModal}
        handleClickEdit={handleClickEdit}
        ideaId={undefined}
        intl={intl}
        {...localizeProps}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when an idea is provided', () => {
    const ideaId = 'myIdeasiD';
    const idea = getIdea(ideaId);
    const wrapper = shallow(
      <IdeaContent
        closeSideModal={closeSideModal}
        handleClickEdit={handleClickEdit}
        ideaId={ideaId}
        ideaImages={null}
        ideaFiles={null}
        idea={idea}
        intl={intl}
        {...localizeProps}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
