import React from 'react';

import { useFormContext } from 'react-hook-form';

import { act, fireEvent, render, screen } from 'utils/testUtils/rtl';

import DraftPhaseDescription from './index';

const mockUpdatePhase = jest.fn();

jest.mock('api/phases/usePhases', () => () => ({ data: { data: [] } }));
jest.mock('api/phases/useUpdatePhase', () => () => ({
  mutate: mockUpdatePhase,
  isPending: false,
}));
jest.mock('utils/router', () => ({
  useParams: () => ({ projectId: 'project' }),
}));
jest.mock('components/HookForm/QuillMultilocWithLocaleSwitcher', () => () => {
  const { register } = useFormContext();
  return <textarea {...register('draft_description_multiloc.en')} />;
});

beforeEach(() => {
  jest.useFakeTimers();
  mockUpdatePhase.mockClear();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

const editDescription = () => {
  const rendered = render(
    <DraftPhaseDescription
      phaseId="phase"
      descriptionMultiloc={{ en: 'Published description' }}
      draftDescriptionMultiloc={{ en: 'Saved draft' }}
    />
  );
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'Latest draft' },
  });

  return rendered;
};

it('saves the latest draft when leaving before the autosave delay expires', () => {
  const { unmount } = editDescription();
  unmount();

  act(() => jest.advanceTimersByTime(1000));

  expect(mockUpdatePhase).toHaveBeenCalledWith({
    phaseId: 'phase',
    draft_description_multiloc: { en: 'Latest draft' },
  });
});

it('does not autosave an explicitly discarded draft', () => {
  const { unmount } = editDescription();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  unmount();

  act(() => jest.advanceTimersByTime(1000));

  expect(mockUpdatePhase).toHaveBeenCalledTimes(1);
  expect(mockUpdatePhase.mock.calls[0][0]).toEqual({
    phaseId: 'phase',
    draft_description_multiloc: {},
  });
});
