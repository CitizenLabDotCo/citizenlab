import React from 'react';
import { shallow } from 'enzyme';
import { localizeProps } from 'utils/testUtils/localizeProps';
import { getDummyIntlObject } from 'utils/testUtils/mockedIntl';
import { getIdea } from 'services/__mocks__/ideas';
import { getAppConfigurationData } from 'services/__mocks__/appConfiguration';
import { getLocale } from 'services/__mocks__/locale';
import { getProject } from 'services/__mocks__/projects';

jest.mock('containers/IdeasShow/PostedBy', () => 'PostedBy');
jest.mock(
  'containers/IdeasShow/IdeaProposedBudget',
  () => 'IdeaProposedBudget'
);
jest.mock('components/PostShowComponents/Title', () => 'Title');
jest.mock('components/PostShowComponents/Body', () => 'Body');
jest.mock('components/PostShowComponents/DropdownMap', () => 'DropdownMap');
jest.mock(
  'components/PostShowComponents/OfficialFeedback',
  () => 'OfficialFeedback'
);
jest.mock('components/PostShowComponents/Comments', () => 'Comments');
jest.mock('components/UI/FileAttachments', () => 'FileAttachments');
jest.mock('components/UI/Button', () => 'Button');
jest.mock('cl2-component-library', () => ({ IconTooltip: 'IconTooltip' }));
jest.mock('../PostPreview', () => ({
  Top: 'Top',
  Content: 'Content',
  Container: 'Container',
}));
jest.mock('./FeedbackSettings', () => 'FeedbackSettings');
jest.mock('./VotePreview', () => 'VotePreview');
jest.mock('utils/cl-router/Link', () => 'Link');
jest.mock('components/T', () => 'T');
jest.mock('services/ideas');
jest.mock('resources/GetResourceFiles', () => 'GetResourceFiles');
jest.mock('resources/GetIdea', () => 'GetIdea');
jest.mock('resources/GetIdeaImages', () => 'GetIdeaImages');
jest.mock('resources/GetAppConfiguration', () => 'GetAppConfiguration');
jest.mock('resources/GetProject', () => 'GetProject');
jest.mock('resources/GetPermission', () => 'GetPermission');
jest.mock('resources/GetLocale', () => 'GetLocale');
jest.mock('utils/cl-intl');
jest.mock('utils/styleUtils', () => ({
  colors: {
    label: '#000',
    separation: '#000',
    adminTextColor: '#000',
  },
  fontSizes: {
    base: 16,
  },
  media: {
    smallerThanMinTablet: (x) => x,
  },
}));

import { IdeaContent } from './IdeaContent';

describe('<IdeaContent />', () => {
  let closePreview: jest.Mock;
  let handleClickEdit: jest.Mock;

  beforeEach(() => {
    closePreview = jest.fn();
    handleClickEdit = jest.fn();
  });

  it('renders correctly when ideaId is not defined', () => {
    const intl = getDummyIntlObject();
    const project = getProject();
    const wrapper = shallow(
      <IdeaContent
        ideaId={null}
        closePreview={closePreview}
        handleClickEdit={handleClickEdit}
        project={project}
        idea={null}
        ideaImages={null}
        ideaFiles={null}
        tenant={null}
        locale={null}
        postOfficialFeedbackPermission={undefined}
        intl={intl}
        {...localizeProps}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('renders correctly when an idea is provided', () => {
    const ideaId = 'myIdeasiD';
    const idea = getIdea(ideaId);
    const locale = getLocale();
    const tenant = getAppConfigurationData();
    const project = getProject();
    const intl = getDummyIntlObject();
    const wrapper = shallow(
      <IdeaContent
        ideaId={ideaId}
        closePreview={closePreview}
        handleClickEdit={handleClickEdit}
        idea={idea}
        tenant={tenant}
        locale={locale}
        project={project}
        ideaImages={null}
        ideaFiles={null}
        postOfficialFeedbackPermission={undefined}
        intl={intl}
        {...localizeProps}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
