import React from 'react';

import { FormProvider, useForm } from 'react-hook-form';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import { ResolvedFormBuilderConfig } from 'components/FormBuilder/utils';

import { render, screen } from 'utils/testUtils/rtl';

import AnswerVisibilityToggle from '.';

jest.mock('hooks/useFeatureFlag', () => jest.fn(() => true));

jest.mock('api/submission_count/useSubmissionCount', () =>
  jest.fn(() => ({
    data: { data: { attributes: { totalSubmissions: 0 } } },
  }))
);

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ phaseId: 'phaseId' }),
}));

const renderToggle = ({
  code,
  isParticipationPublic = true,
}: {
  code?: string;
  isParticipationPublic?: boolean;
} = {}) => {
  const Wrapper = () => {
    const methods = useForm({
      defaultValues: {
        customFields: [
          { input_type: 'text', answers_visible_to: 'moderators' },
        ],
      },
    });

    return (
      <FormProvider {...methods}>
        <AnswerVisibilityToggle
          field={{ index: 0, code } as IFlatCustomFieldWithIndex}
          builderConfig={{ isParticipationPublic } as ResolvedFormBuilderConfig}
        />
      </FormProvider>
    );
  };

  render(<Wrapper />);
};

const toggle = () =>
  screen.queryByRole('checkbox', { name: /public answers/i });

describe('AnswerVisibilityToggle', () => {
  it('lets a custom question of a public method show its answers', () => {
    renderToggle();

    expect(toggle()).toBeInTheDocument();
  });

  it('is not offered for a built-in field', () => {
    renderToggle({ code: 'title_multiloc' });

    expect(toggle()).not.toBeInTheDocument();
  });

  it('is not offered when the method keeps all answers private', () => {
    renderToggle({ isParticipationPublic: false });

    expect(toggle()).not.toBeInTheDocument();
  });
});
