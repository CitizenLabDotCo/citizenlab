import { AskUserQuestion } from 'api/ai_assistant_tool_calls/tools/askUser';

import { act, renderHook } from 'utils/testUtils/rtl';

import useAskUserForm from './useAskUserForm';

const when: AskUserQuestion = {
  question: 'When should it start?',
  options: ['This month', 'Next month'],
};
const who: AskUserQuestion = {
  question: 'Who is it for?',
  options: ['Residents', 'Businesses'],
  multi_select: true,
};

const renderForm = (questions: AskUserQuestion[]) =>
  renderHook(() => useAskUserForm(questions)).result;

describe('useAskUserForm', () => {
  it('moves on to the next question once a single choice is picked', () => {
    const form = renderForm([when, who]);

    act(() => form.current.togglePick('Next month'));

    expect(form.current.current).toBe(who);
    expect(form.current.answers).toEqual([
      { question: when.question, answer: 'Next month' },
    ]);
  });

  it('stays on the question while the user writes their own answer', () => {
    const form = renderForm([when, who]);

    act(() => form.current.setWritten('After the summer'));
    act(() => form.current.togglePick('Next month'));

    expect(form.current.current).toBe(when);
  });

  it('stays on a multiple choice question to pick more options', () => {
    const form = renderForm([who, when]);

    act(() => form.current.togglePick('Residents'));

    expect(form.current.current).toBe(who);
  });

  it('stays on the last question until the answers are sent', () => {
    const form = renderForm([when]);

    act(() => form.current.togglePick('Next month'));

    expect(form.current).toMatchObject({ current: when, isLastQuestion: true });
  });
});
