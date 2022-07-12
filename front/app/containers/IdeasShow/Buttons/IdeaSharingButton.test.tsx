import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import IdeaSharingButton from './IdeaSharingButton';
import SharingButtonComponent from './SharingButtonComponent';
import translationMessages from 'i18n/en';

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    process_type: 'continuous',
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

const ideaId = '5';

jest.mock('services/projects');
jest.mock('services/auth');
jest.mock('services/appConfiguration');
jest.mock('hooks/useProject', () => jest.fn(() => mockProjectData));
jest.mock('hooks/useIdea', () => {
  return jest.fn(() => mockIdeaData);
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

    screen
      .getByText(
        (translationMessages as Record<string, string>)[
          'app.containers.IdeasShow.share'
        ]
      )
      .click();
    screen.getByLabelText('Share via WhatsApp').click();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://api.whatsapp.com/send?phone=&text=Support%20this%20idea%3A%20Test%20Idea https://demo.stg.citizenlab.co/ideas/undefined?utm_source=share_idea&utm_campaign=share_content&utm_medium=whatsapp&utm_content=522ae8cc-a5ed-4d31-9aa0-470904934ec6'
    );
  });
});
