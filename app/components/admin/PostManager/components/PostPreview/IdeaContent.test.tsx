import React from 'react';
import { shallow } from 'enzyme';

import { localizeProps } from 'utils/testUtils/localizeProps';
import { intl } from 'utils/cl-intl';
import { getIdea } from 'services/ideas';

jest.mock('resources/GetUsers', () => 'GetUsers');
jest.mock('resources/GetResourceFiles', () => 'GetResourceFiles');
jest.mock('resources/GetIdea', () => 'GetIdea');
jest.mock('resources/GetTenant', () => 'GetTenant');
jest.mock('resources/GetProject', () => 'GetProject');
jest.mock('containers/IdeasShow/IdeaAuthor', () => 'IdeaAuthor');
jest.mock('containers/IdeasShow/IdeaTitle', () => 'IdeaTitle');
jest.mock('containers/IdeasShow/IdeaBody', () => 'IdeaBody');
jest.mock('containers/IdeasShow/OfficialFeedback', () => 'OfficialFeedback');
jest.mock('containers/IdeasShow/Comments', () => 'Comments');
jest.mock('components/UI/FileAttachments', () => 'FileAttachments');
jest.mock('components/UI/Button', () => 'Button');
jest.mock('components/admin/InfoTooltip', () => 'InfoTooltip');
jest.mock('./IdeaSettings', () => 'IdeaSettings');
jest.mock('./VotePreview', () => 'VotePreview');
jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('components/T', () => 'T');
jest.mock('./', () => ({
  Top: () => 'Top',
  Content: () => 'Content',
  Container: () => 'Container'
}));
jest.mock('services/ideas');
jest.mock('utils/cl-intl');

import { IdeaContent } from './IdeaContent';

describe('<IdeaContent />', () => {
  let closePreview: jest.Mock;
  let handleClickEdit: jest.Mock;
  beforeEach(() => {
    closePreview = jest.fn();
    handleClickEdit = jest.fn();
  });

  it('renders correctly when ideaId is not defined', () => {
    const wrapper = shallow(
      <IdeaContent
        closePreview={closePreview}
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
        closePreview={closePreview}
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
