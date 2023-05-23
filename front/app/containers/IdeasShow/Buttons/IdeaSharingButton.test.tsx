import React from 'react';
import { render, screen } from 'utils/testUtils/rtl';
import IdeaSharingButton from './IdeaSharingButton';
import SharingButtonComponent from './SharingButtonComponent';
import translationMessages from 'i18n/en';
import { ideaData as mockIdeaData } from 'api/ideas/__mocks__/useIdeaById';

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    process_type: 'continuous',
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
    input_term: 'idea',
  },
};

const ideaId = '5';

jest.mock('api/projects/types');
jest.mock('services/auth');

jest.mock('api/projects/useProjectById', () =>
  jest.fn(() => ({ data: { data: mockProjectData } }))
);

jest.mock('api/ideas/useIdeaById', () => {
  return jest.fn(() => ({ data: { data: mockIdeaData[0] } }));
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
      `https://api.whatsapp.com/send?phone=&text=Support%20this%20idea%3A%20Idea%201%20title https://demo.stg.citizenlab.co/ideas/${mockIdeaData[0].attributes.slug}?utm_source=share_idea&utm_campaign=share_content&utm_medium=whatsapp&utm_content=522ae8cc-a5ed-4d31-9aa0-470904934ec6`
    );
  });
});
