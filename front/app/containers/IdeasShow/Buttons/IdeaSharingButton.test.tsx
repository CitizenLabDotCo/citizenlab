import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import IdeaSharingButton from './IdeaSharingButton';
import SharingButtonComponent from './SharingButtonComponent';

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    process_type: 'idea',
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
  },
};

const mockIdeaData = {
  id: '5',
  type: 'idea',
  attributes: {
    title_multiloc: { en: 'Test Idea' },
  },
  relationships: {
    project: {
      data: {
        id: '2',
      },
    },
  },
};

const viewId = '1';
const ideaId = '5';

jest.mock('react-intl');
jest.mock('services/projects');
jest.mock('utils/cl-intl');
jest.mock('services/auth');
jest.mock('services/appConfiguration');
jest.mock('resources/GetLocale', () => 'GetLocale');
jest.mock('hooks/useProject', () => jest.fn(() => mockProjectData));
jest.mock('utils/cl-router/Link');
jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
});

jest.mock('react-router', () => {
  return {
    withRouter: (Component) => {
      return (props) => {
        return <Component {...props} params={{ viewId }} />;
      };
    },
  };
});

describe('IdeaSharingButton', () => {
  it('should result in correct sharing URL', () => {
    render(
      <IdeaSharingButton
        className="sharingButton"
        ideaId={ideaId}
        buttonComponent={<SharingButtonComponent />}
      />
    );
    screen.debug();
  });
});
